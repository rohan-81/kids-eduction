// Kid-friendly Coloring Book Templates for KidsZone Drawing Studio
// Features 8 recognizable, adorable cartoon outlines with bold lines for toddlers and young children

export interface ColoringTemplate {
  id: string;
  emoji: string;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  recommendedColors: string[];
  promptGu: string;
  promptHi: string;
  promptEn: string;
  svgUri: string;
}

const wrapSvg = (innerSvg: string): string => {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">${innerSvg}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
};

export const COLORING_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'apple',
    emoji: '🍎',
    nameGu: 'સફરજન',
    nameHi: 'सेब',
    nameEn: 'Apple',
    recommendedColors: ['#EF4444', '#10B981', '#78350F'],
    promptGu: 'સફરજનમાં સરસ લાલ રંગ અને પાંદડામાં લીલો રંગ પૂરો!',
    promptHi: 'सेब में सुंदर लाल रंग और पत्ते में हरा रंग भरें!',
    promptEn: "Let's color the Apple! Paint it red with a green leaf!",
    svgUri: wrapSvg(`
      <g stroke="#334155" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Stem -->
        <path d="M160,80 Q168,45 185,35" stroke-width="8" stroke="#78350F" />
        <!-- Leaf -->
        <path d="M165,70 Q215,50 220,75 Q210,105 165,70 Z" fill="#DCFCE7" stroke="#15803D" stroke-width="5" />
        <path d="M165,70 Q195,73 220,75" stroke="#15803D" stroke-width="3" />
        <!-- Apple Body -->
        <path d="M160,95 C120,60 60,90 60,170 C60,240 120,285 160,285 C200,285 260,240 260,170 C260,90 200,60 160,95 Z" fill="#FEF2F2" stroke="#DC2626" stroke-width="7" />
        <!-- Cute Smiling Face -->
        <circle cx="125" cy="165" r="7" fill="#1E293B" stroke="none" />
        <circle cx="195" cy="165" r="7" fill="#1E293B" stroke="none" />
        <path d="M142,185 Q160,205 178,185" stroke="#DC2626" stroke-width="4" />
        <!-- Rosy Cheeks -->
        <circle cx="108" cy="180" r="10" fill="#FCA5A5" opacity="0.6" stroke="none" />
        <circle cx="212" cy="180" r="10" fill="#FCA5A5" opacity="0.6" stroke="none" />
      </g>
    `),
  },
  {
    id: 'sun',
    emoji: '☀️',
    nameGu: 'હસતો સૂર્ય',
    nameHi: 'हंसता सूरज',
    nameEn: 'Happy Sun',
    recommendedColors: ['#F59E0B', '#EF4444', '#FBBF24'],
    promptGu: 'હસતા સૂર્યનારાયણમાં પીળો અને કેસરી રંગ પૂરો!',
    promptHi: 'हंसते सूरज में सुंदर पीला और संतरी रंग भरें!',
    promptEn: "Color the smiling Sun with bright yellow and orange!",
    svgUri: wrapSvg(`
      <g stroke="#D97706" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Sun Rays -->
        <line x1="160" y1="20" x2="160" y2="55" stroke-width="8" stroke="#F59E0B" />
        <line x1="160" y1="265" x2="160" y2="300" stroke-width="8" stroke="#F59E0B" />
        <line x1="20" y1="160" x2="55" y2="160" stroke-width="8" stroke="#F59E0B" />
        <line x1="265" y1="160" x2="300" y2="160" stroke-width="8" stroke="#F59E0B" />
        <line x1="60" y1="60" x2="85" y2="85" stroke-width="8" stroke="#F59E0B" />
        <line x1="235" y1="235" x2="260" y2="260" stroke-width="8" stroke="#F59E0B" />
        <line x1="260" y1="60" x2="235" y2="85" stroke-width="8" stroke="#F59E0B" />
        <line x1="60" y1="260" x2="85" y2="235" stroke-width="8" stroke="#F59E0B" />
        <!-- Big Round Sun -->
        <circle cx="160" cy="160" r="85" fill="#FEF3C7" stroke="#D97706" stroke-width="7" />
        <!-- Happy Eyes -->
        <path d="M125,145 Q135,135 145,145" stroke="#78350F" stroke-width="6" />
        <path d="M175,145 Q185,135 195,145" stroke="#78350F" stroke-width="6" />
        <!-- Big Smile -->
        <path d="M125,175 Q160,220 195,175" stroke="#DC2626" stroke-width="6" fill="#FEE2E2" />
        <!-- Cheeks -->
        <circle cx="115" cy="170" r="10" fill="#FDE68A" stroke="none" />
        <circle cx="205" cy="170" r="10" fill="#FDE68A" stroke="none" />
      </g>
    `),
  },
  {
    id: 'butterfly',
    emoji: '🦋',
    nameGu: 'પતંગિયું',
    nameHi: 'तितली',
    nameEn: 'Butterfly',
    recommendedColors: ['#EC4899', '#8B5CF6', '#3B82F6', '#F59E0B'],
    promptGu: 'સુંદર પતંગિયાની પાંખોમાં મનગમતા રંગબેરંગી કલર પૂરો!',
    promptHi: 'सुंदर तितली के पंखों में रंग-बिरंगे प्यारे रंग भरें!',
    promptEn: 'Paint the colorful Butterfly wings with your favorite shades!',
    svgUri: wrapSvg(`
      <g stroke="#334155" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Top Left Wing -->
        <path d="M150,130 C120,40 30,50 35,135 C35,185 120,185 150,165" fill="#FDF2F8" stroke="#EC4899" stroke-width="6" />
        <!-- Top Right Wing -->
        <path d="M170,130 C200,40 290,50 285,135 C285,185 200,185 170,165" fill="#FDF2F8" stroke="#EC4899" stroke-width="6" />
        <!-- Bottom Left Wing -->
        <path d="M150,175 C100,185 55,225 75,270 C95,295 150,235 155,200" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="6" />
        <!-- Bottom Right Wing -->
        <path d="M170,175 C220,185 265,225 245,270 C225,295 170,235 165,200" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="6" />
        <!-- Wing Patterns -->
        <circle cx="85" cy="125" r="16" fill="#FCE7F3" stroke="#DB2777" stroke-width="4" />
        <circle cx="235" cy="125" r="16" fill="#FCE7F3" stroke="#DB2777" stroke-width="4" />
        <circle cx="115" cy="245" r="12" fill="#DDD6FE" stroke="#7C3AED" stroke-width="4" />
        <circle cx="205" cy="245" r="12" fill="#DDD6FE" stroke="#7C3AED" stroke-width="4" />
        <!-- Body -->
        <rect x="150" y="105" width="20" height="125" rx="10" fill="#334155" />
        <!-- Head -->
        <circle cx="160" cy="95" r="16" fill="#334155" />
        <!-- Antennae -->
        <path d="M155,80 Q130,45 120,55" stroke="#334155" stroke-width="4" />
        <circle cx="118" cy="55" r="5" fill="#334155" stroke="none" />
        <path d="M165,80 Q190,45 200,55" stroke="#334155" stroke-width="4" />
        <circle cx="202" cy="55" r="5" fill="#334155" stroke="none" />
      </g>
    `),
  },
  {
    id: 'flower',
    emoji: '🌸',
    nameGu: 'સુંદર ફૂલ',
    nameHi: 'सुंदर फूल',
    nameEn: 'Happy Flower',
    recommendedColors: ['#EC4899', '#F59E0B', '#10B981'],
    promptGu: 'ફૂલની પાંદડીઓમાં ગુલાબી અને વચ્ચે પીળો રંગ પૂરો!',
    promptHi: 'फूल की पंखुड़ियों में गुलाबी और बीच में पीला रंग भरें!',
    promptEn: 'Color the flower petals pink and the center yellow!',
    svgUri: wrapSvg(`
      <g stroke="#334155" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Stem -->
        <path d="M160,200 Q155,250 160,300" stroke="#15803D" stroke-width="9" />
        <!-- Leaves -->
        <path d="M158,245 Q115,220 95,250 Q135,270 158,255" fill="#DCFCE7" stroke="#15803D" stroke-width="5" />
        <path d="M162,260 Q205,235 225,265 Q185,285 162,270" fill="#DCFCE7" stroke="#15803D" stroke-width="5" />
        <!-- Petals -->
        <circle cx="160" cy="85" r="38" fill="#FDF2F8" stroke="#DB2777" stroke-width="6" />
        <circle cx="215" cy="115" r="38" fill="#FDF2F8" stroke="#DB2777" stroke-width="6" />
        <circle cx="215" cy="180" r="38" fill="#FDF2F8" stroke="#DB2777" stroke-width="6" />
        <circle cx="160" cy="210" r="38" fill="#FDF2F8" stroke="#DB2777" stroke-width="6" />
        <circle cx="105" cy="180" r="38" fill="#FDF2F8" stroke="#DB2777" stroke-width="6" />
        <circle cx="105" cy="115" r="38" fill="#FDF2F8" stroke="#DB2777" stroke-width="6" />
        <!-- Center Disc -->
        <circle cx="160" cy="148" r="42" fill="#FEF3C7" stroke="#D97706" stroke-width="6" />
        <!-- Smiling Face -->
        <circle cx="146" cy="140" r="5" fill="#78350F" stroke="none" />
        <circle cx="174" cy="140" r="5" fill="#78350F" stroke="none" />
        <path d="M148,158 Q160,172 172,158" stroke="#DC2626" stroke-width="4" />
      </g>
    `),
  },
  {
    id: 'car',
    emoji: '🚗',
    nameGu: 'રમકડાની કાર',
    nameHi: 'खिलौना कार',
    nameEn: 'Toy Car',
    recommendedColors: ['#3B82F6', '#EF4444', '#1E293B', '#F59E0B'],
    promptGu: 'ગાડીમાં સરસ વાદળી કે લાલ રંગ પૂરો!',
    promptHi: 'गाड़ी में सुंदर नीला या लाल रंग भरें!',
    promptEn: 'Paint the cool toy car with bright blue or red!',
    svgUri: wrapSvg(`
      <g stroke="#334155" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Car Body Outline -->
        <path d="M40,215 L40,185 C40,180 50,175 70,170 L95,120 C105,100 130,95 160,95 L215,95 C235,95 250,110 260,135 L285,175 C295,180 300,190 300,205 L300,225 C300,235 290,235 285,235 L255,235 C255,210 220,210 220,235 L120,235 C120,210 85,210 85,235 L50,235 C40,235 40,225 40,215 Z" fill="#EFF6FF" stroke="#2563EB" stroke-width="6" />
        <!-- Windows -->
        <path d="M110,125 L155,125 L155,165 L85,165 Z" fill="#DBEAFE" stroke="#1E40AF" stroke-width="4" />
        <path d="M170,125 L225,125 L245,165 L170,165 Z" fill="#DBEAFE" stroke="#1E40AF" stroke-width="4" />
        <!-- Headlight & Taillight -->
        <rect x="290" y="185" width="10" height="20" rx="3" fill="#FCD34D" stroke="#D97706" stroke-width="2" />
        <rect x="40" y="185" width="8" height="18" rx="2" fill="#FCA5A5" stroke="#DC2626" stroke-width="2" />
        <!-- Left Wheel -->
        <circle cx="102" cy="235" r="28" fill="#334155" stroke="#0F172A" stroke-width="5" />
        <circle cx="102" cy="235" r="14" fill="#94A3B8" stroke="#475569" stroke-width="3" />
        <!-- Right Wheel -->
        <circle cx="238" cy="235" r="28" fill="#334155" stroke="#0F172A" stroke-width="5" />
        <circle cx="238" cy="235" r="14" fill="#94A3B8" stroke="#475569" stroke-width="3" />
      </g>
    `),
  },
  {
    id: 'fish',
    emoji: '🐠',
    nameGu: 'નાની માછલી',
    nameHi: 'छोटी मछली',
    nameEn: 'Little Fish',
    recommendedColors: ['#F59E0B', '#3B82F6', '#06B6D4', '#EC4899'],
    promptGu: 'પાણીમાં તરતી માછલીમાં કેસરી અને વાદળી રંગ પૂરો!',
    promptHi: 'पानी में तैरती मछली में संतरी और नीला रंग भरें!',
    promptEn: 'Color the swimming little fish with orange and blue!',
    svgUri: wrapSvg(`
      <g stroke="#334155" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Bubbles -->
        <circle cx="45" cy="90" r="12" fill="#E0F2FE" stroke="#0284C7" stroke-width="4" />
        <circle cx="70" cy="65" r="7" fill="#E0F2FE" stroke="#0284C7" stroke-width="3" />
        <!-- Tail Fin -->
        <path d="M225,160 L295,95 Q280,160 295,225 Z" fill="#FEF3C7" stroke="#D97706" stroke-width="6" />
        <!-- Top Fin -->
        <path d="M140,95 Q170,55 200,95 Z" fill="#FDE68A" stroke="#D97706" stroke-width="5" />
        <!-- Bottom Fin -->
        <path d="M150,225 Q175,265 195,225 Z" fill="#FDE68A" stroke="#D97706" stroke-width="5" />
        <!-- Main Body -->
        <path d="M70,160 C90,85 200,85 235,160 C200,235 90,235 70,160 Z" fill="#FFFBEB" stroke="#D97706" stroke-width="7" />
        <!-- Eye -->
        <circle cx="115" cy="145" r="12" fill="#FFFFFF" stroke="#334155" stroke-width="4" />
        <circle cx="112" cy="145" r="6" fill="#1E293B" stroke="none" />
        <!-- Smile -->
        <path d="M75,165 Q85,175 95,168" stroke="#DC2626" stroke-width="4" />
        <!-- Gill Arch -->
        <path d="M145,120 Q160,160 145,200" stroke="#D97706" stroke-width="4" />
        <!-- Scales -->
        <path d="M175,135 Q185,150 175,165" stroke="#F59E0B" stroke-width="4" />
        <path d="M195,150 Q205,165 195,180" stroke="#F59E0B" stroke-width="4" />
      </g>
    `),
  },
  {
    id: 'house',
    emoji: '🏠',
    nameGu: 'નાનું ઘર',
    nameHi: 'छोटा घर',
    nameEn: 'Sweet Home',
    recommendedColors: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
    promptGu: 'ઘરના છાપરામાં લાલ અને દીવાલોમાં પીળો રંગ પૂરો!',
    promptHi: 'घर की छत में लाल और दीवारों में पीला रंग भरें!',
    promptEn: 'Paint the roof red and the walls with warm yellow!',
    svgUri: wrapSvg(`
      <g stroke="#334155" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Chimney -->
        <rect x="200" y="65" width="25" height="50" fill="#FEE2E2" stroke="#DC2626" stroke-width="5" />
        <line x1="195" y1="65" x2="230" y2="65" stroke="#DC2626" stroke-width="6" />
        <!-- Roof Triangle -->
        <polygon points="160,65 40,150 280,150" fill="#FEE2E2" stroke="#DC2626" stroke-width="7" />
        <!-- House Walls -->
        <rect x="60" y="150" width="200" height="120" fill="#FEF3C7" stroke="#D97706" stroke-width="6" />
        <!-- Front Door -->
        <rect x="135" y="195" width="50" height="75" rx="5" fill="#E2E8F0" stroke="#475569" stroke-width="5" />
        <circle cx="175" cy="235" r="4" fill="#0F172A" stroke="none" />
        <!-- Left Window -->
        <rect x="80" y="175" width="40" height="40" rx="3" fill="#DBEAFE" stroke="#2563EB" stroke-width="4" />
        <line x1="100" y1="175" x2="100" y2="215" stroke="#2563EB" stroke-width="3" />
        <line x1="80" y1="195" x2="120" y2="195" stroke="#2563EB" stroke-width="3" />
        <!-- Right Window -->
        <rect x="200" y="175" width="40" height="40" rx="3" fill="#DBEAFE" stroke="#2563EB" stroke-width="4" />
        <line x1="220" y1="175" x2="220" y2="215" stroke="#2563EB" stroke-width="3" />
        <line x1="200" y1="195" x2="240" y2="195" stroke="#2563EB" stroke-width="3" />
      </g>
    `),
  },
  {
    id: 'star',
    emoji: '⭐',
    nameGu: 'ચમકતો તારો',
    nameHi: 'चमकता तारा',
    nameEn: 'Twinkling Star',
    recommendedColors: ['#F59E0B', '#FBBF24', '#EC4899'],
    promptGu: 'ચમકતા તારામાં સોનેરી પીળો રંગ પૂરો!',
    promptHi: 'चमकते तारे में सुनहरा पीला रंग भरें!',
    promptEn: 'Color the twinkling star with sparkling golden yellow!',
    svgUri: wrapSvg(`
      <g stroke="#D97706" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- 5-Point Star -->
        <polygon points="160,35 195,115 285,120 220,180 240,265 160,220 80,265 100,180 35,120 125,115" fill="#FEF3C7" stroke="#D97706" stroke-width="7" />
        <!-- Happy Eyes -->
        <circle cx="138" cy="145" r="7" fill="#78350F" stroke="none" />
        <circle cx="182" cy="145" r="7" fill="#78350F" stroke="none" />
        <!-- Happy Mouth -->
        <path d="M145,170 Q160,190 175,170" stroke="#DC2626" stroke-width="5" />
        <!-- Cheeks -->
        <circle cx="122" cy="165" r="9" fill="#FCA5A5" opacity="0.7" stroke="none" />
        <circle cx="198" cy="165" r="9" fill="#FCA5A5" opacity="0.7" stroke="none" />
      </g>
    `),
  },
];
