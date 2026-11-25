"""
Validation module for educational questions and stories.
Used by:
  - Question.clean() (Django Admin & Model validation)
  - backend/add_content_tool.py (CLI & bulk imports)
  - check-content audit command
"""

from typing import Tuple, List, Dict, Any

VALID_GAME_TYPES = {
    'find-letter',
    'picture-matching',
    'counting',
    'memory-match',
    'missing-letter',
    'colors-shapes',
    'listen-choose',
    'balloon-pop',
    'math-quiz',
    'picture-puzzle',
    'find-object',
    'logic-reasoning',
    'odd-one-out',
    'shadow-match',
    'rhyme-match',
    'letter-tracing',
    'duel',
    'daily-challenge',
    'shop-math',
    'word-builder',
    'adventure',
    'quiz',
}

VALID_LANGUAGES = {'gu', 'hi', 'en', 'all'}
VALID_AGE_GROUPS = {'2-4', '4-6', '6-8', 'all'}


def validate_question_data(data: Dict[str, Any], strict: bool = False) -> Tuple[bool, List[str], Dict[str, Any]]:
    """
    Validates a question dictionary.
    Returns: (is_valid, list_of_errors, sanitized_data)
    """
    errors = []
    sanitized = dict(data)

    # 1. Question Type
    q_type = str(data.get('question_type', '')).strip().lower()
    if not q_type:
        errors.append("Missing required field 'question_type'.")
    elif q_type not in VALID_GAME_TYPES:
        errors.append(f"Invalid question_type '{q_type}'. Allowed: {sorted(VALID_GAME_TYPES)}")
    else:
        sanitized['question_type'] = q_type

    # 2. Language
    lang = str(data.get('language', 'gu')).strip().lower()
    if lang not in VALID_LANGUAGES:
        errors.append(f"Invalid language '{lang}'. Allowed: {sorted(VALID_LANGUAGES)}")
    else:
        sanitized['language'] = lang

    # 3. Age Group
    age = str(data.get('age_group', 'all')).strip().lower()
    if age not in VALID_AGE_GROUPS:
        # Backward compatibility for legacy '5-8'
        if age == '5-8':
            age = '6-8'
        else:
            errors.append(f"Invalid age_group '{age}'. Allowed: {sorted(VALID_AGE_GROUPS)}")
    sanitized['age_group'] = age

    # 4. Question Text
    text = str(data.get('question_text', '')).strip()
    if not text:
        errors.append("Missing or empty 'question_text'.")
    elif len(text) > 255:
        errors.append(f"'question_text' exceeds 255 characters (length: {len(text)}).")
    sanitized['question_text'] = text

    # 5. Options Validation
    options = data.get('options')
    if not isinstance(options, list):
        errors.append(f"'options' must be a JSON list/array of option objects, got {type(options).__name__}.")
        options = []
        sanitized['options'] = []
    else:
        # Check minimum 2 options (standard MCQs require 2 to 4 options)
        # Note: memory-match and picture-puzzle in legacy data had 1-2 options
        min_opts = 2 if q_type not in ('picture-puzzle',) else 1
        if len(options) < min_opts:
            errors.append(f"Game type '{q_type}' requires at least {min_opts} options, found {len(options)}.")

        valid_options = []
        option_ids = set()
        for idx, opt in enumerate(options):
            if isinstance(opt, str):
                # Auto-upgrade plain string to option object: {'id': str(idx+1), 'label': opt}
                opt_obj = {'id': str(idx + 1), 'label': opt}
            elif isinstance(opt, dict):
                opt_id = str(opt.get('id', '')).strip()
                opt_label = str(opt.get('label', '')).strip()
                if not opt_id:
                    opt_id = str(idx + 1)
                opt_obj = dict(opt)
                opt_obj['id'] = opt_id
                opt_obj['label'] = opt_label or opt_id
            else:
                errors.append(f"Option index {idx} is invalid format: {opt}.")
                continue

            if opt_obj['id'] in option_ids:
                errors.append(f"Duplicate option id '{opt_obj['id']}' at index {idx}.")
            option_ids.add(opt_obj['id'])
            valid_options.append(opt_obj)

        sanitized['options'] = valid_options

    # 6. Correct Answer / Correct Option ID alignment
    option_ids = {opt['id'] for opt in sanitized.get('options', []) if isinstance(opt, dict) and 'id' in opt}
    raw_answer = str(data.get('correct_answer', '')).strip()
    raw_opt_id = str(data.get('correct_option_id', '')).strip()

    # Determine canonical correct option ID
    chosen_id = None
    if raw_opt_id and raw_opt_id in option_ids:
        chosen_id = raw_opt_id
    elif raw_answer and raw_answer in option_ids:
        chosen_id = raw_answer
    else:
        # Check if raw_answer matches an option label
        for opt in sanitized.get('options', []):
            if isinstance(opt, dict) and str(opt.get('label', '')).strip().lower() == raw_answer.lower():
                chosen_id = opt['id']
                break

    if not chosen_id and option_ids:
        errors.append(
            f"Correct answer ('{raw_answer}' / '{raw_opt_id}') does not match any valid option id {sorted(option_ids)}."
        )
    elif chosen_id:
        sanitized['correct_answer'] = chosen_id
        sanitized['correct_option_id'] = chosen_id

    # 7. Disallow placeholder or broken URLs
    for url_field in ('image', 'audio'):
        val = str(data.get(url_field, '')).strip()
        if 'example.com' in val:
            errors.append(f"Placeholder domain 'example.com' is not allowed in '{url_field}'.")

    # 8. Visual / Audio prompts
    if 'display_visual' in data:
        sanitized['display_visual'] = str(data.get('display_visual') or '').strip()
    if 'audio_text' in data:
        sanitized['audio_text'] = str(data.get('audio_text') or '').strip()

    # 9. Difficulty and points range
    try:
        diff = int(data.get('difficulty', 1))
        sanitized['difficulty'] = max(1, min(diff, 5))
    except (ValueError, TypeError):
        sanitized['difficulty'] = 1

    try:
        pts = int(data.get('points', 10))
        sanitized['points'] = max(0, min(pts, 100))
    except (ValueError, TypeError):
        sanitized['points'] = 10

    is_valid = len(errors) == 0
    return is_valid, errors, sanitized
