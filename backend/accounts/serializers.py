from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from child_profiles.models import ChildProfile
from child_profiles.serializers import ChildProfileSerializer


class UserSerializer(serializers.ModelSerializer):
    child_profiles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'child_profiles']
        read_only_fields = ['id', 'date_joined']

    def get_child_profiles(self, obj):
        active_profiles = obj.child_profiles.filter(is_active=True).order_by('created_at')
        return ChildProfileSerializer(active_profiles, many=True).data


class RegisterSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    child_nickname = serializers.CharField(write_only=True, required=False, allow_blank=True, default='Little Learner')
    child_age_group = serializers.ChoiceField(
        choices=ChildProfile.AGE_GROUP_CHOICES,
        write_only=True,
        required=False,
        default='2-4'
    )
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'parent_name',
            'child_nickname',
            'child_age_group',
        ]
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
        }

    def validate_username(self, value):
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise serializers.ValidationError('Username must be at least 3 characters long.')
        if User.objects.filter(username__iexact=cleaned).exists():
            raise serializers.ValidationError('This username is already taken. Please choose another.')
        return cleaned

    def validate(self, attrs):
        # Run Django's AUTH_PASSWORD_VALIDATORS (common / numeric / similarity / length).
        candidate = User(username=attrs.get('username', ''), email=attrs.get('email', '') or '')
        try:
            validate_password(attrs.get('password', ''), user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        return attrs

    def validate_email(self, value):
        if value:
            cleaned = value.strip().lower()
            if User.objects.filter(email__iexact=cleaned).exists():
                raise serializers.ValidationError('An account with this email address already exists.')
            return cleaned
        return value

    def create(self, validated_data):
        parent_name = validated_data.pop('parent_name', '').strip()
        child_nickname = validated_data.pop('child_nickname', 'Little Learner').strip() or 'Little Learner'
        child_age_group = validated_data.pop('child_age_group', '2-4')
        password = validated_data.pop('password')
        username = validated_data.get('username')
        email = validated_data.get('email', '').strip().lower()

        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=parent_name
            )

            # Create auth token for seamless instant login
            Token.objects.get_or_create(user=user)

            # Create initial child profile linked to this parent
            ChildProfile.objects.create(
                parent=user,
                nickname=child_nickname,
                age_group=child_age_group
            )

            return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        identifier = data.get('username', '').strip()
        password = data.get('password', '')

        if not identifier or not password:
            raise serializers.ValidationError('Both username/email and password are required.')

        user = None

        # Check if identifier is an email address
        if '@' in identifier:
            try:
                matched_user = User.objects.get(email__iexact=identifier)
                user = authenticate(username=matched_user.username, password=password)
            except User.DoesNotExist:
                user = None
            except User.MultipleObjectsReturned:
                # If duplicate emails, fallback to username match
                matched_user = User.objects.filter(email__iexact=identifier).first()
                if matched_user:
                    user = authenticate(username=matched_user.username, password=password)
        else:
            # Case-insensitive username match
            try:
                matched_user = User.objects.get(username__iexact=identifier)
                user = authenticate(username=matched_user.username, password=password)
            except User.DoesNotExist:
                user = authenticate(username=identifier, password=password)
            except User.MultipleObjectsReturned:
                matched_user = User.objects.filter(username__iexact=identifier).first()
                if matched_user:
                    user = authenticate(username=matched_user.username, password=password)
                else:
                    user = authenticate(username=identifier, password=password)

        if not user:
            raise serializers.ValidationError('Invalid username/email or password.')

        if not user.is_active:
            raise serializers.ValidationError('This user account has been disabled.')

        data['user'] = user
        return data

