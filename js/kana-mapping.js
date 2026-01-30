/**
 * KANA_MAPPING
 * Maps Japanese Hiragana characters to valid Romaji input patterns.
 * Used for flexible typing evaluation.
 */
const KANA_MAPPING = {
    // Basic
    'あ': ['a'], 'い': ['i', 'yi'], 'う': ['u', 'wu', 'whu'], 'え': ['e'], 'お': ['o'],
    'か': ['ka', 'ca'], 'き': ['ki'], 'く': ['ku', 'cu', 'qu'], 'け': ['ke'], 'こ': ['ko', 'co'],
    'さ': ['sa'], 'し': ['shi', 'si', 'ci'], 'す': ['su'], 'せ': ['se', 'ce'], 'そ': ['so'],
    'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
    'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
    'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
    'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
    'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
    'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
    'わ': ['wa'], 'を': ['wo'], 'ん': ['nn', 'xn', 'n'], // 'n' handling requires special logic for next char

    // Dakuten
    'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
    'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
    'だ': ['da'], 'ぢ': ['ji', 'di'], 'づ': ['zu', 'du'], 'で': ['de'], 'ど': ['do'],
    'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
    'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],

    // Small Kana
    'ぁ': ['la', 'xa'], 'ぃ': ['li', 'xi'], 'ぅ': ['lu', 'xu'], 'ぇ': ['le', 'xe'], 'ぉ': ['lo', 'xo'],
    'っ': ['ltu', 'xtu', 'ltsu'], // Double consonant handling is special
    'ゃ': ['lya', 'xya'], 'ゅ': ['lyu', 'xyu'], 'ょ': ['lyo', 'xyo'],
    'ゎ': ['lwa', 'xwa'],

    // Combined (Yoon) - These could be generated but explicit map is safer
    'きゃ': ['kya', 'kixya'], 'きゅ': ['kyu', 'kixyu'], 'きょ': ['kyo', 'kixyo'],
    'しゃ': ['sha', 'sya', 'sixya'], 'しゅ': ['shu', 'syu', 'sixyu'], 'しょ': ['sho', 'syo', 'sixyo'],
    'ちゃ': ['cha', 'tya', 'tixya', 'cya'], 'ちゅ': ['chu', 'tyu', 'tixyu', 'cyu'], 'ちょ': ['cho', 'tyo', 'tixyo', 'cyo'],
    'にゃ': ['nya', 'nixya'], 'にゅ': ['nyu', 'nixyu'], 'にょ': ['nyo', 'nixyo'],
    'ひゃ': ['hya', 'hixya'], 'ひゅ': ['hyu', 'hixyu'], 'ひょ': ['hyo', 'hixyo'],
    'みゃ': ['mya', 'mixya'], 'みゅ': ['myu', 'mixyu'], 'みょ': ['myo', 'mixyo'],
    'りゃ': ['rya', 'rixya'], 'りゅ': ['ryu', 'rixyu'], 'りょ': ['ryo', 'rixyo'],
    'ぎゃ': ['gya', 'gixya'], 'ぎゅ': ['gyu', 'gixyu'], 'ぎょ': ['gyo', 'gixyo'],
    'じゃ': ['ja', 'zya', 'jixya'], 'じゅ': ['ju', 'zyu', 'jixyu'], 'じょ': ['jo', 'zyo', 'jixyo'],
    'びゃ': ['bya', 'bixya'], 'びゅ': ['byu', 'bixyu'], 'びょ': ['byo', 'bixyo'],
    'ぴゃ': ['pya', 'pixya'], 'ぴゅ': ['pyu', 'pixyu'], 'ぴょ': ['pyo', 'pixyo'],

    // Special
    'ー': ['-'], '、': [','], '。': ['.'], '！': ['!'], '？': ['?'],
    'うぁ': ['wha'], 'うぃ': ['whi'], 'うぇ': ['whe'], 'うぉ': ['who'],
    'ゔ': ['vu'], 'ゔぁ': ['va'], 'ゔぃ': ['vi'], 'ゔぇ': ['ve'], 'ゔぉ': ['vo'],
    'てぃ': ['thi'], 'てゅ': ['thu'], 'でぃ': ['dhi'], 'でゅ': ['dhu'],
    'ふぁ': ['fa'], 'ふぃ': ['fi'], 'ふぇ': ['fe'], 'ふぉ': ['fo']
};

window.KANA_MAPPING = KANA_MAPPING;
