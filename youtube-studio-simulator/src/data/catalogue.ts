import type { VideoSeed } from './types';

type Seed = Omit<VideoSeed, 'id' | 'kind' | 'likeRate' | 'commentRate' | 'subRate' | 'rpmWeight' | 'monetisation' | 'restriction'> &
  Partial<Pick<VideoSeed, 'likeRate' | 'commentRate' | 'subRate' | 'rpmWeight' | 'monetisation' | 'restriction'>>;

const m = (min: number, sec: number) => min * 60 + sec;

/**
 * The channel's 47 published long-form documentaries, oldest → newest.
 * `appeal` controls long-tail popularity; the analytics engine turns these into daily views.
 */
const LONG_FORM: Seed[] = [
  {
    title: 'The Rise and Fall of Babylon Explained',
    hook: 'For a thousand years Babylon was the greatest city on Earth. Then, in a single night, it fell.',
    durationSec: m(14, 12), topic: 'Mesopotamia', tags: ['babylon', 'mesopotamia', 'ancient history', 'nebuchadnezzar'],
    thumb: { scene: 'stepPyramid', palette: 'desert', text: 'Babylon|Fell', align: 'left' },
    appeal: 0.42, ctr: 4.1, retention: 0.41,
  },
  {
    title: 'What Happened to the Library of Alexandria?',
    hook: 'The greatest collection of knowledge in the ancient world vanished – but not in the way you were taught.',
    durationSec: m(12, 48), topic: 'Ancient Egypt', tags: ['library of alexandria', 'ancient egypt', 'lost knowledge'],
    thumb: { scene: 'library', palette: 'ember', text: 'All|Gone', align: 'left' },
    appeal: 0.55, ctr: 4.6, retention: 0.43,
  },
  {
    title: 'The Bronze Age Collapse: When Civilisation Ended',
    hook: 'Around 1177 BC, nearly every major civilisation in the Mediterranean collapsed within a few decades.',
    durationSec: m(17, 31), topic: 'Bronze Age', tags: ['bronze age collapse', 'sea peoples', '1177 bc'],
    thumb: { scene: 'burningCity', palette: 'blood', text: 'The End|Of Everything', align: 'left' },
    appeal: 0.78, ctr: 5.3, retention: 0.44,
  },
  {
    title: 'How the Vikings Discovered America 500 Years Before Columbus',
    hook: 'Leif Erikson reached North America around the year 1000. So why did the Norse settlers disappear?',
    durationSec: m(13, 5), topic: 'Vikings', tags: ['vikings', 'leif erikson', 'vinland', 'l\'anse aux meadows'],
    thumb: { scene: 'longship', palette: 'ice', text: '1000 AD', align: 'left', arrow: true },
    appeal: 0.66, ctr: 5.1, retention: 0.45,
  },
  {
    title: 'The Mysterious Disappearance of an Entire Civilisation',
    hook: 'Five million people lived in the cities of the Indus Valley. Then they simply… left.',
    durationSec: m(15, 40), topic: 'Indus Valley', tags: ['indus valley', 'harappa', 'mohenjo daro', 'lost civilisation'],
    thumb: { scene: 'ruins', palette: 'dusk', text: 'They|Vanished', align: 'right', question: true },
    appeal: 1.15, ctr: 6.4, retention: 0.46,
  },
  {
    title: 'Life in Ancient Pompeii: The Day Before Vesuvius',
    hook: 'What were the people of Pompeii doing on the 23rd of August, 79 AD – the last normal day of their lives?',
    durationSec: m(16, 22), topic: 'Ancient Rome', tags: ['pompeii', 'vesuvius', 'ancient rome', 'roman life'],
    thumb: { scene: 'volcano', palette: 'ember', text: '24 Hours|Left', align: 'left' },
    appeal: 0.95, ctr: 5.9, retention: 0.47,
  },
  {
    title: 'The Real Story of King Arthur',
    hook: 'Was there ever a real Arthur? We follow the trail from Roman Britain to the legends of Camelot.',
    durationSec: m(18, 3), topic: 'Medieval Britain', tags: ['king arthur', 'camelot', 'roman britain', 'legends'],
    thumb: { scene: 'castle', palette: 'night', text: 'Was He|Real?', align: 'left', font: 'cinzel', textColor: 'gold' },
    appeal: 0.6, ctr: 5.0, retention: 0.42,
  },
  {
    title: 'Why the Aztec Empire Fell So Quickly',
    hook: 'In 1519 Tenochtitlan was one of the largest cities in the world. Two years later it was gone.',
    durationSec: m(19, 47), topic: 'Aztecs', tags: ['aztec empire', 'tenochtitlan', 'cortes', 'conquistadors'],
    thumb: { scene: 'stepPyramid', palette: 'blood', text: '2 Years', align: 'right', arrow: true },
    appeal: 0.9, ctr: 5.8, retention: 0.44,
  },
  {
    title: 'The Strangest Laws in Ancient History',
    hook: 'From Roman fathers who could legally sell their sons to Spartan laws against being fat.',
    durationSec: m(11, 36), topic: 'Ancient World', tags: ['ancient laws', 'roman law', 'sparta', 'weird history'],
    thumb: { scene: 'scroll', palette: 'sepia', text: 'Illegal?!', align: 'left', textColor: 'yellow' },
    appeal: 0.7, ctr: 5.6, retention: 0.5,
  },
  {
    title: 'What Actually Happened to the Lost City of Atlantis?',
    hook: 'Plato described a mighty island empire swallowed by the sea. We separate the myth from the history.',
    durationSec: m(16, 55), topic: 'Mysteries', tags: ['atlantis', 'plato', 'thera', 'minoans', 'lost city'],
    thumb: { scene: 'storm', palette: 'ocean', text: 'Atlantis|Found?', align: 'left' },
    appeal: 2.25, ctr: 7.6, retention: 0.47, surge: [6, 26, 1.4],
  },
  {
    title: 'The Last Day of Constantinople',
    hook: 'On the 29th of May 1453, the final remnant of the Roman Empire made its last stand.',
    durationSec: m(21, 14), topic: 'Byzantium', tags: ['constantinople', '1453', 'byzantine empire', 'ottomans'],
    thumb: { scene: 'fortress', palette: 'crimson', text: '29 May|1453', align: 'right', font: 'cinzel', textColor: 'gold' },
    appeal: 1.2, ctr: 6.2, retention: 0.43,
  },
  {
    title: 'How 300 Spartans Changed History',
    hook: 'Thermopylae was a defeat. So why do we still talk about it 2,500 years later?',
    durationSec: m(17, 9), topic: 'Ancient Greece', tags: ['sparta', 'thermopylae', 'leonidas', '300', 'persian wars'],
    thumb: { scene: 'helmet', palette: 'blood', text: '300', align: 'left', textColor: 'white' },
    appeal: 2.05, ctr: 7.9, retention: 0.48,
  },
  {
    title: 'The Darkest Secrets of Ancient Egypt',
    hook: 'Behind the gold and the pyramids lay a world of tomb robbers, poisonings and royal conspiracies.',
    durationSec: m(22, 30), topic: 'Ancient Egypt', tags: ['ancient egypt', 'pharaohs', 'harem conspiracy', 'tomb robbers'],
    thumb: { scene: 'sphinx', palette: 'gold', text: 'Hidden|For 3000 Years', align: 'left' },
    appeal: 2.7, ctr: 8.1, retention: 0.45, surge: [3, 30, 0.9],
  },
  {
    title: 'Why Nobody Could Defeat the Mongol Empire',
    hook: 'From the steppe to the gates of Vienna – how a confederation of nomads built an unstoppable war machine.',
    durationSec: m(24, 11), topic: 'Mongols', tags: ['mongol empire', 'genghis khan', 'steppe', 'medieval warfare'],
    thumb: { scene: 'army', palette: 'dusk', text: 'Unstoppable', align: 'left', textColor: 'yellow' },
    appeal: 5.6, ctr: 9.6, retention: 0.47, surge: [5, 45, 2.6], subRate: 1.5,
  },
  {
    title: 'The Terrifying Reign of Ivan the Terrible',
    hook: 'Russia\'s first Tsar began as a reformer. He ended as one of history\'s most feared rulers.',
    durationSec: m(18, 44), topic: 'Russia', tags: ['ivan the terrible', 'tsar', 'russian history', 'oprichnina'],
    thumb: { scene: 'crown', palette: 'crimson', text: 'Terrible', align: 'left' },
    appeal: 1.05, ctr: 6.1, retention: 0.44,
  },
  {
    title: 'What Was Life Like as a Roman Legionary?',
    hook: 'Twenty-five years of marching, digging, fighting and surviving on the edge of the empire.',
    durationSec: m(20, 2), topic: 'Ancient Rome', tags: ['roman legion', 'legionary', 'roman army', 'daily life'],
    thumb: { scene: 'shield', palette: 'crimson', text: '25 Years', align: 'left' },
    appeal: 1.6, ctr: 7.0, retention: 0.49,
  },
  {
    title: 'The Lost Roman Legion That Vanished Without a Trace',
    hook: 'Five thousand soldiers of the Ninth Legion marched north into Caledonia – and history loses them.',
    durationSec: m(15, 18), topic: 'Ancient Rome', tags: ['ninth legion', 'roman britain', 'caledonia', 'mystery'],
    thumb: { scene: 'forest', palette: 'storm', text: '5,000 Men|Gone', align: 'left' },
    appeal: 1.75, ctr: 7.4, retention: 0.46,
  },
  {
    title: 'The Most Terrifying Day in Ancient Rome',
    hook: 'The Battle of Cannae, 216 BC: the day Rome lost tens of thousands of men in a single afternoon.',
    durationSec: m(19, 26), topic: 'Ancient Rome', tags: ['cannae', 'hannibal', 'ancient rome', 'punic wars'],
    thumb: { scene: 'colosseum', palette: 'blood', text: 'Rome\'s|Worst Day', align: 'left', arrow: true },
    appeal: 3.6, ctr: 8.8, retention: 0.48, surge: [4, 24, 1.2], subRate: 1.2,
  },
  {
    title: 'Easter Island: The Civilisation That Destroyed Itself?',
    hook: 'The popular story says the Rapa Nui cut down every tree. The evidence says something very different.',
    durationSec: m(14, 51), topic: 'Mysteries', tags: ['easter island', 'rapa nui', 'moai', 'collapse'],
    thumb: { scene: 'moai', palette: 'dusk', text: 'The Truth', align: 'right' },
    appeal: 1.25, ctr: 6.5, retention: 0.47,
  },
  {
    title: 'The Forgotten Kingdom of Kush',
    hook: 'The Nubian kings who conquered Egypt and ruled as pharaohs – and then were written out of history.',
    durationSec: m(16, 3), topic: 'Africa', tags: ['kingdom of kush', 'nubia', 'meroe', 'black pharaohs'],
    thumb: { scene: 'pyramids', palette: 'gold', text: 'Forgotten|Pharaohs', align: 'left', flip: true },
    appeal: 0.85, ctr: 5.7, retention: 0.45,
  },
  {
    title: 'How Genghis Khan Built the Largest Empire in History',
    hook: 'An outcast boy abandoned on the steppe became the ruler of 24 million square kilometres.',
    durationSec: m(23, 37), topic: 'Mongols', tags: ['genghis khan', 'temujin', 'mongol empire', 'conquest'],
    thumb: { scene: 'map', palette: 'sepia', text: '24 Million|KM²', align: 'right' },
    appeal: 2.1, ctr: 7.7, retention: 0.46,
  },
  {
    title: 'The Children\'s Crusade: History\'s Most Tragic March',
    hook: 'In 1212, thousands of young people set out to free Jerusalem. Almost none of them came home.',
    durationSec: m(13, 58), topic: 'Crusades', tags: ['childrens crusade', 'crusades', 'medieval history', '1212'],
    thumb: { scene: 'town', palette: 'storm', text: '1212', align: 'left', textColor: 'red' },
    appeal: 0.8, ctr: 5.6, retention: 0.43,
  },
  {
    title: 'What Life Was Really Like During the Black Death',
    hook: 'Between 1347 and 1351, the plague killed perhaps half of Europe. This is what it was like to live through it.',
    durationSec: m(21, 49), topic: 'Medieval Europe', tags: ['black death', 'plague', 'medieval europe', 'pandemic'],
    thumb: { scene: 'plague', palette: 'green', text: '1 In 2|Died', align: 'right' },
    appeal: 4.4, ctr: 9.1, retention: 0.5, surge: [3, 35, 1.6], subRate: 1.3,
  },
  {
    title: 'The Most Dangerous Jobs in Medieval England',
    hook: 'Gong farmers, leech collectors and plague-pit diggers: the worst jobs of the Middle Ages.',
    durationSec: m(12, 33), topic: 'Medieval Europe', tags: ['medieval jobs', 'gong farmer', 'medieval england', 'daily life'],
    thumb: { scene: 'town', palette: 'sepia', text: 'Worst|Job Ever', align: 'right', flip: true },
    appeal: 1.45, ctr: 7.2, retention: 0.52,
  },
  {
    title: 'The Most Brutal Punishments in Medieval History',
    hook: 'Medieval justice was public, theatrical and designed to terrify. A look at how punishment really worked.',
    durationSec: m(16, 41), topic: 'Medieval Europe', tags: ['medieval punishments', 'medieval justice', 'dark history'],
    thumb: { scene: 'skull', palette: 'crimson', text: 'Brutal', align: 'left' },
    appeal: 3.1, ctr: 8.6, retention: 0.47, monetisation: 'limited', rpmWeight: 0.32,
  },
  {
    title: 'The Carthaginian General Who Almost Destroyed Rome',
    hook: 'Hannibal crossed the Alps with elephants and spent fifteen years undefeated in Italy.',
    durationSec: m(20, 55), topic: 'Ancient Rome', tags: ['hannibal', 'carthage', 'punic wars', 'alps'],
    thumb: { scene: 'swords', palette: 'gold', text: 'Rome\'s|Nightmare', align: 'left' },
    appeal: 1.9, ctr: 7.5, retention: 0.46,
  },
  {
    title: 'The Great Emu War: Australia\'s Strangest Battle',
    hook: 'In 1932 the Australian army deployed machine guns against 20,000 emus. The emus won.',
    durationSec: m(10, 24), topic: 'Modern History', tags: ['great emu war', 'australia', 'weird history', '1932'],
    thumb: { scene: 'emu', palette: 'desert', text: 'They Lost|To Birds', align: 'left' },
    appeal: 1.55, ctr: 8.2, retention: 0.56,
  },
  {
    title: 'The Roman Emperor Who Declared War on the Sea',
    hook: 'Caligula marched his legions to the shore and ordered them to attack the waves. Or did he?',
    durationSec: m(15, 7), topic: 'Ancient Rome', tags: ['caligula', 'roman emperor', 'ancient rome', 'mad emperors'],
    thumb: { scene: 'storm', palette: 'night', text: 'Insane|Emperor', align: 'right', arrow: true },
    appeal: 3.3, ctr: 9.0, retention: 0.49, surge: [2, 20, 1.1],
  },
  {
    title: 'The Dancing Plague of 1518',
    hook: 'In Strasbourg, hundreds of people danced for days without stopping. Some danced until they died.',
    durationSec: m(11, 49), topic: 'Mysteries', tags: ['dancing plague', '1518', 'strasbourg', 'mass hysteria'],
    thumb: { scene: 'town', palette: 'purple', text: 'Danced|To Death', align: 'left' },
    appeal: 1.35, ctr: 7.3, retention: 0.51,
  },
  {
    title: 'What Really Sank the Spanish Armada?',
    hook: 'Fire ships, Atlantic storms and a fatal plan – the true story of 1588.',
    durationSec: m(17, 52), topic: 'Tudor England', tags: ['spanish armada', '1588', 'elizabeth i', 'naval history'],
    thumb: { scene: 'galleon', palette: 'storm', text: '1588', align: 'right', textColor: 'yellow' },
    appeal: 1.1, ctr: 6.3, retention: 0.45,
  },
  {
    title: 'Inside the Secret Society of the Knights Templar',
    hook: 'They were warrior monks, bankers and the richest order in Christendom – until Friday the 13th, 1307.',
    durationSec: m(19, 13), topic: 'Crusades', tags: ['knights templar', 'crusades', 'friday the 13th', 'secret societies'],
    thumb: { scene: 'shield', palette: 'night', text: 'Friday|The 13th', align: 'left', textColor: 'white' },
    appeal: 1.85, ctr: 7.6, retention: 0.47,
  },
  {
    title: 'The Samurai\'s Final Stand: The Battle of Shiroyama',
    hook: 'Five hundred samurai against thirty thousand imperial soldiers. The end of an age in Japan.',
    durationSec: m(16, 37), topic: 'Japan', tags: ['samurai', 'shiroyama', 'saigo takamori', 'meiji'],
    thumb: { scene: 'torii', palette: 'blood', text: 'The Last|Samurai', align: 'left' },
    appeal: 1.4, ctr: 7.0, retention: 0.46,
  },
  {
    title: 'How Rome Actually Fell (It Wasn\'t What You Think)',
    hook: 'No single battle ended Rome. A slow-motion collapse over two centuries did.',
    durationSec: m(24, 46), topic: 'Ancient Rome', tags: ['fall of rome', 'western roman empire', '476 ad', 'decline'],
    thumb: { scene: 'ruins', palette: 'blood', text: 'Not What|You Think', align: 'left', flip: true },
    appeal: 2.35, ctr: 7.8, retention: 0.44,
  },
  {
    title: 'The Wrong Turn That Started World War One',
    hook: 'On the 28th of June 1914, a driver took a wrong turn in Sarajevo – and the world went to war.',
    durationSec: m(14, 29), topic: 'Modern History', tags: ['ww1', 'franz ferdinand', 'sarajevo', '1914'],
    thumb: { scene: 'town', palette: 'sepia', text: 'One|Wrong Turn', align: 'right', arrow: true },
    appeal: 1.3, ctr: 6.9, retention: 0.5,
  },
  {
    title: 'The Sumerians: The First Civilisation on Earth',
    hook: 'Writing, the wheel, the 60-minute hour – the Sumerians invented the modern world 5,000 years ago.',
    durationSec: m(22, 4), topic: 'Mesopotamia', tags: ['sumerians', 'mesopotamia', 'uruk', 'first civilisation'],
    thumb: { scene: 'stepPyramid', palette: 'dusk', text: 'The First', align: 'left' },
    appeal: 1.5, ctr: 6.8, retention: 0.45,
  },
  {
    title: 'Why Medieval Castles Were Almost Impossible to Conquer',
    hook: 'Moats, murder holes and concentric walls: the engineering that made sieges last for years.',
    durationSec: m(18, 18), topic: 'Medieval Europe', tags: ['medieval castles', 'sieges', 'castle design', 'warfare'],
    thumb: { scene: 'castle', palette: 'dusk', text: 'Impossible', align: 'left', textColor: 'yellow', flip: true },
    appeal: 1.65, ctr: 7.1, retention: 0.48,
  },
  {
    title: 'The Mayan Collapse: What Really Happened?',
    hook: 'The great Maya cities of the south were abandoned in the 9th century. Drought, war – or both?',
    durationSec: m(17, 26), topic: 'Maya', tags: ['maya', 'mayan collapse', 'tikal', 'mesoamerica'],
    thumb: { scene: 'stepPyramid', palette: 'green', text: 'Abandoned', align: 'right' },
    appeal: 1.2, ctr: 6.4, retention: 0.45,
  },
  {
    title: 'The Tomb Robbers of Ancient Egypt',
    hook: 'Almost every royal tomb in Egypt was looted in antiquity. The court records name the thieves.',
    durationSec: m(15, 55), topic: 'Ancient Egypt', tags: ['tomb robbers', 'valley of the kings', 'ancient egypt', 'heist'],
    thumb: { scene: 'pyramids', palette: 'night', text: 'Robbed', align: 'left', circle: true },
    appeal: 1.45, ctr: 7.0, retention: 0.47,
  },
  {
    title: 'Cleopatra: The Truth Behind the Legend',
    hook: 'The last pharaoh of Egypt was a scholar, a strategist and a survivor – not just a seductress.',
    durationSec: m(20, 38), topic: 'Ancient Egypt', tags: ['cleopatra', 'ptolemaic egypt', 'mark antony', 'julius caesar'],
    thumb: { scene: 'sphinx', palette: 'purple', text: 'The Real|Cleopatra', align: 'left', font: 'cinzel', textColor: 'gold' },
    appeal: 1.7, ctr: 7.2, retention: 0.46,
  },
  {
    title: 'The Viking Raid That Shocked the World',
    hook: '8 June 793: longships appear off Lindisfarne, and the Viking Age begins.',
    durationSec: m(14, 7), topic: 'Vikings', tags: ['lindisfarne', 'vikings', '793', 'anglo saxons'],
    thumb: { scene: 'longship', palette: 'blood', text: '793 AD', align: 'right', flip: true },
    appeal: 1.6, ctr: 7.3, retention: 0.47,
  },
  {
    title: 'The Most Powerful Woman in Medieval Europe',
    hook: 'Queen of France, then Queen of England, mother of three kings: Eleanor of Aquitaine.',
    durationSec: m(19, 2), topic: 'Medieval Europe', tags: ['eleanor of aquitaine', 'plantagenets', 'medieval queens'],
    thumb: { scene: 'crown', palette: 'gold', text: 'Queen|Of Two Kingdoms', align: 'left', font: 'cinzel', textColor: 'white' },
    appeal: 1.15, ctr: 6.2, retention: 0.44,
  },
  {
    title: 'The Siege of Masada: Rome\'s Most Brutal Siege',
    hook: 'Nine hundred rebels on a mountain fortress against the full weight of the Tenth Legion.',
    durationSec: m(17, 44), topic: 'Ancient Rome', tags: ['masada', 'roman siege', 'tenth legion', 'jewish revolt'],
    thumb: { scene: 'fortress', palette: 'desert', text: 'No Escape', align: 'right' },
    appeal: 1.55, ctr: 7.1, retention: 0.46, restriction: 'copyright', monetisation: 'claimed', rpmWeight: 0,
  },
  {
    title: 'Nero: Did Rome Really Burn on His Orders?',
    hook: 'In July 64 AD, Rome burned for six days. Was the emperor really to blame?',
    durationSec: m(16, 14), topic: 'Ancient Rome', tags: ['nero', 'great fire of rome', '64 ad', 'roman emperors'],
    thumb: { scene: 'burningCity', palette: 'ember', text: 'Guilty?', align: 'left', question: true },
    appeal: 2.0, ctr: 8.0, retention: 0.48,
  },
  {
    title: 'The Lost Colony of Roanoke: America\'s Oldest Mystery',
    hook: '115 English settlers vanished, leaving one word carved into a post: CROATOAN.',
    durationSec: m(15, 33), topic: 'Mysteries', tags: ['roanoke', 'lost colony', 'croatoan', 'colonial america'],
    thumb: { scene: 'forest', palette: 'night', text: 'Croatoan', align: 'left', textColor: 'red' },
    appeal: 1.8, ctr: 7.9, retention: 0.49,
  },
  {
    title: 'How Ancient Egyptians Really Built the Pyramids',
    hook: 'No aliens, no slaves – just extraordinary organisation, ramps, copper tools and 20,000 workers.',
    durationSec: m(21, 21), topic: 'Ancient Egypt', tags: ['pyramids', 'giza', 'ancient engineering', 'ancient egypt'],
    thumb: { scene: 'pyramids', palette: 'desert', text: 'How?', align: 'left', arrow: true },
    appeal: 2.3, ctr: 8.3, retention: 0.47,
  },
  {
    title: 'Salamis: The Sea Battle That Saved Greece',
    hook: 'In 480 BC, the Greek fleet lured the Persian navy into a narrow strait. Western history turned on that morning.',
    durationSec: m(18, 9), topic: 'Ancient Greece', tags: ['salamis', 'themistocles', 'persian wars', 'trireme'],
    thumb: { scene: 'galleon', palette: 'gold', text: 'Outnumbered', align: 'right', flip: true },
    appeal: 1.7, ctr: 7.4, retention: 0.46,
  },
  {
    title: 'The Forgotten Empire That Almost Conquered the World',
    hook: 'At its height, the Achaemenid Persian Empire ruled 44% of the world\'s population. Why do so few people know its story?',
    durationSec: m(19, 24), topic: 'Persia', tags: ['persian empire', 'achaemenid', 'cyrus the great', 'darius', 'xerxes'],
    thumb: { scene: 'temple', palette: 'gold', text: '44% Of|The World', align: 'left', arrow: true },
    appeal: 2.9, ctr: 8.9, retention: 0.47, subRate: 1.15,
  },
];

const SHORTS: Seed[] = [
  { title: 'The emperor who made his horse a senator 🐎 #shorts', hook: 'Caligula and Incitatus.', durationSec: 41, topic: 'Ancient Rome', tags: ['shorts', 'caligula', 'rome'], thumb: { scene: 'colosseum', palette: 'gold', text: 'Senator|Horse?' }, appeal: 1.2, ctr: 0, retention: 0.82 },
  { title: 'Why Romans used urine as mouthwash #history', hook: 'Ancient dental care.', durationSec: 34, topic: 'Ancient Rome', tags: ['shorts', 'rome', 'weird history'], thumb: { scene: 'temple', palette: 'desert', text: 'Wait…|What?' }, appeal: 1.9, ctr: 0, retention: 0.88 },
  { title: 'The deadliest job in ancient Egypt #shorts', hook: 'Embalmers, quarrymen, and tomb builders.', durationSec: 47, topic: 'Ancient Egypt', tags: ['shorts', 'egypt'], thumb: { scene: 'pyramids', palette: 'ember', text: 'Deadliest|Job' }, appeal: 1.0, ctr: 0, retention: 0.79 },
  { title: 'Vikings didn\'t wear horned helmets #shorts', hook: 'Blame 19th-century opera.', durationSec: 29, topic: 'Vikings', tags: ['shorts', 'vikings', 'myths'], thumb: { scene: 'longship', palette: 'ice', text: 'Myth|Busted' }, appeal: 1.6, ctr: 0, retention: 0.9 },
  { title: 'The Spartan training no one talks about #history', hook: 'The agoge.', durationSec: 52, topic: 'Ancient Greece', tags: ['shorts', 'sparta'], thumb: { scene: 'helmet', palette: 'crimson', text: 'Age 7' }, appeal: 2.4, ctr: 0, retention: 0.84 },
  { title: 'Napoleon wasn\'t actually short #shorts', hook: 'French inches vs English inches.', durationSec: 31, topic: 'Modern History', tags: ['shorts', 'napoleon'], thumb: { scene: 'crown', palette: 'night', text: '5\'7"' }, appeal: 1.3, ctr: 0, retention: 0.87 },
  { title: 'The shortest war in history lasted 38 minutes #shorts', hook: 'The Anglo-Zanzibar War, 1896.', durationSec: 38, topic: 'Modern History', tags: ['shorts', 'zanzibar', 'war'], thumb: { scene: 'galleon', palette: 'ocean', text: '38|Minutes' }, appeal: 2.8, ctr: 0, retention: 0.91 },
  { title: 'Cleopatra lived closer to the Moon landing than the pyramids #shorts', hook: 'Time is weird.', durationSec: 27, topic: 'Ancient Egypt', tags: ['shorts', 'cleopatra', 'pyramids'], thumb: { scene: 'sphinx', palette: 'purple', text: 'Mind|Blown' }, appeal: 2.2, ctr: 0, retention: 0.93 },
  { title: 'A medieval cure that actually worked #shorts', hook: 'Bald\'s Leechbook.', durationSec: 44, topic: 'Medieval Europe', tags: ['shorts', 'medieval medicine'], thumb: { scene: 'scroll', palette: 'green', text: 'It|Worked' }, appeal: 1.1, ctr: 0, retention: 0.8 },
  { title: 'Mongol messengers rode 200 miles a day #shorts', hook: 'The Yam system.', durationSec: 36, topic: 'Mongols', tags: ['shorts', 'mongols'], thumb: { scene: 'army', palette: 'dusk', text: '200|Miles' }, appeal: 1.5, ctr: 0, retention: 0.85 },
  { title: 'The Colosseum had a retractable roof #shorts', hook: 'The velarium.', durationSec: 33, topic: 'Ancient Rome', tags: ['shorts', 'colosseum'], thumb: { scene: 'colosseum', palette: 'blood', text: 'A Roof?!' }, appeal: 1.7, ctr: 0, retention: 0.86 },
  { title: 'What the plague doctor mask was really for #shorts', hook: 'Miasma theory.', durationSec: 39, topic: 'Medieval Europe', tags: ['shorts', 'plague doctor'], thumb: { scene: 'plague', palette: 'storm', text: 'Why|The Beak?' }, appeal: 2.6, ctr: 0, retention: 0.88 },
  { title: 'Ancient Romans had fast food #shorts', hook: 'The thermopolium.', durationSec: 30, topic: 'Ancient Rome', tags: ['shorts', 'pompeii', 'food'], thumb: { scene: 'volcano', palette: 'dusk', text: 'Fast Food|79 AD' }, appeal: 1.4, ctr: 0, retention: 0.89 },
  { title: 'The Great Emu War in 45 seconds #shorts', hook: 'Australia vs. emus.', durationSec: 45, topic: 'Modern History', tags: ['shorts', 'emu war'], thumb: { scene: 'emu', palette: 'desert', text: 'Emus|Won' }, appeal: 2.1, ctr: 0, retention: 0.9 },
];

function finalise(seed: Seed, index: number, kind: 'video' | 'short'): VideoSeed {
  const id = `${kind === 'video' ? 'v' : 's'}${String(index + 1).padStart(2, '0')}-${seed.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 28)
    .replace(/-+$/, '')}`;
  return {
    id,
    kind,
    likeRate: kind === 'short' ? 0.052 : 0.036 + (seed.retention - 0.4) * 0.05,
    commentRate: kind === 'short' ? 0.0009 : 0.0014 + (seed.ctr > 8 ? 0.0006 : 0),
    subRate: 1,
    rpmWeight: kind === 'short' ? 0.025 : 1,
    monetisation: 'on',
    restriction: 'none',
    ...seed,
  };
}

export const LONG_FORM_SEEDS: VideoSeed[] = LONG_FORM.map((s, i) => finalise(s, i, 'video'));
export const SHORT_SEEDS: VideoSeed[] = SHORTS.map((s, i) => finalise(s, i, 'short'));

/** Upcoming / unpublished items shown in the Content table but not counted as published. */
export const UNPUBLISHED = [
  {
    id: 'v48-byzantine-empire',
    title: 'The Byzantine Empire: Rome\'s Final Thousand Years',
    hook: 'You asked for it. When the Western Empire fell in 476, the Roman Empire carried on in the East for another thousand years.',
    durationSec: m(26, 18),
    topic: 'Byzantium',
    tags: ['byzantine empire', 'justinian', 'constantinople', 'eastern roman empire'],
    thumb: { scene: 'temple', palette: 'purple', text: '1000 More|Years', align: 'right', font: 'cinzel', textColor: 'gold' } as const,
    visibility: 'scheduled' as const,
    scheduledInDays: 3,
  },
  {
    id: 'v49-sea-peoples',
    title: 'The Sea Peoples: History\'s Most Mysterious Invaders',
    hook: 'Who were the raiders who helped bring the Bronze Age to an end?',
    durationSec: m(18, 40),
    topic: 'Bronze Age',
    tags: ['sea peoples', 'bronze age collapse', 'ramesses iii'],
    thumb: { scene: 'longship', palette: 'storm', text: 'Who Were|They?', align: 'left', question: true } as const,
    visibility: 'draft' as const,
    scheduledInDays: 0,
  },
];
