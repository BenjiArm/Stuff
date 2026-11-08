import { LONG_FORM_SEEDS, SHORT_SEEDS } from './catalogue';
import { SEEDED_TIMING, SESSION_START } from './analytics';
import type { CommentStatus, StudioComment } from './types';

const AVATAR_COLOURS = ['#e8710a', '#1e8e3e', '#d93025', '#1a73e8', '#9334e6', '#e52592', '#12b5cb', '#f9ab00', '#5f6368', '#188038', '#a142f4', '#c5221f', '#0b8043', '#795548'];

export function avatarColourFor(handle: string) {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) >>> 0;
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
}

type Row = [video: number | `s${number}`, handle: string, text: string, minutesAgo: number, likes: number, status?: CommentStatus, extra?: Partial<StudioComment> & { creatorReply?: string; otherReplies?: [string, string, number][] }];

const MIN = 60_000;
const H = 60;
const D = 24 * 60;

const ROWS: Row[] = [
  // Latest upload – The Forgotten Empire
  [46, '@marcus_aurelius_fan', 'This is genuinely one of the best explanations of the Persian Empire I\'ve ever watched. The way you explained the satrapy system finally made it click for me.', 38, 214, 'published', { isSubscriber: true }],
  [46, '@historynerd_92', 'Cyrus the Great deserves so much more recognition. Freeing the Babylonian captives, the Cyrus Cylinder… incredible ruler.', 64, 167, 'published', { isSubscriber: true }],
  [46, '@DaveThompson-k8x', 'The fact that Persia ruled 44% of the world\'s population is absolutely insane. Why did nobody teach us this at school?', 95, 402, 'published', { isSubscriber: false, otherReplies: [['@ellie.writes', 'Because school history was basically just Greece vs Persia from the Greek point of view 😅', 58]] }],
  [46, '@ancientmapsenjoyer', 'Can you do a follow-up on Alexander\'s conquest of Persia from the Persian perspective?', 2 * H + 10, 96, 'published', { isQuestion: true, isSubscriber: true }],
  [46, '@KarenOsei', 'The narration on this channel just keeps getting better. Perfect Sunday afternoon viewing.', 3 * H + 40, 71, 'published', { isSubscriber: true }],
  [46, '@tomasz.historia', 'Persepolis reconstruction at 11:20 gave me chills. More of these visuals please!', 5 * H + 5, 58, 'published', { isSubscriber: true }],
  [46, '@ryan_mcallister', 'How does this only have 25k views? This is better than half the documentaries on TV.', 7 * H + 30, 133, 'published', { isSubscriber: false }],
  [46, '@xerxes_did_nothing_wrong', 'Finally someone shows Xerxes as more than a 9-foot movie villain 😂', 9 * H, 245, 'published', { isSubscriber: true, creatorReply: 'Ha! He definitely deserves a fairer hearing. Thanks for watching!' }],
  [46, '@lindaharrow', 'What sources did you use for the royal road section? Would love to read more.', 13 * H, 22, 'published', { isQuestion: true, isSubscriber: true }],
  [46, '@quietscholar', 'Watching this at 2am instead of sleeping. No regrets.', 19 * H, 87, 'published', { isSubscriber: true }],
  [46, '@BigJimHistory', 'Achaemenid Empire is the most underrated empire ever and I will die on this hill.', 26 * H, 64, 'published', { isSubscriber: false }],
  [46, '@samirah.k', 'As an Iranian, thank you for telling our history with such respect ❤️', 31 * H, 512, 'published', { isSubscriber: true, hearted: true, creatorReply: 'Thank you so much – this one meant a lot to make. ❤️' }],

  // Salamis
  [45, '@triremegang', 'Themistocles was a genius. Luring the whole Persian fleet into the straits was an insane gamble.', 2 * D + 4 * H, 189, 'published', { isSubscriber: true }],
  [45, '@oliverbrennan', 'Perfect companion piece to the Persia video. Love how this channel connects everything.', 2 * D + 9 * H, 77, 'published', { isSubscriber: true }],
  [45, '@hellenic_heritage', 'Fun fact: Aeschylus actually fought at Salamis and later wrote a play about it!', 3 * D, 141, 'published', { isSubscriber: true }],

  // Pyramids
  [44, '@engineeringhistory', 'As an engineer, the ramp theory explanation was super clear. The internal ramp idea is fascinating.', 4 * D, 230, 'published', { isSubscriber: true }],
  [44, '@notaliens_lol', 'Thank you for not saying aliens. Humans are capable of amazing things.', 5 * D, 388, 'published', { isSubscriber: false, otherReplies: [['@gizaguide', 'The workers\' village findings at Giza are some of the best evidence for this', 44]] }],
  [44, '@mia.chen.reads', 'The 3D visuals of the construction site were stunning.', 6 * D, 52, 'published', { isSubscriber: true }],

  // Roanoke
  [43, '@carolina_local', 'I grew up near Roanoke Island and this is the best explanation I\'ve ever heard. The Hatteras theory makes the most sense.', 6 * D + 3 * H, 176, 'published', { isSubscriber: true }],
  [43, '@mysteryfiles_uk', 'CROATOAN carved into the post still gives me goosebumps.', 8 * D, 94, 'published', { isSubscriber: false }],

  // Nero
  [42, '@senatus_populusque', 'How does this only have 80k views? Incredible documentary. The algorithm needs to wake up.', 9 * D, 321, 'published', { isSubscriber: true, creatorReply: 'Thank you! Honestly comments like this keep me going 🙏' }],
  [42, '@fiddlewhileromeburns', 'He wasn\'t even in Rome when the fire started! Tacitus says he rushed back to organise relief.', 10 * D, 156, 'published', { isSubscriber: true }],
  [42, '@helena_m', 'Your Roman content is the best on YouTube right now.', 12 * D, 61, 'published', { isSubscriber: true }],

  // Masada
  [41, '@jlevin', 'I visited Masada last year. Seeing the Roman ramp in person is unreal. Great video.', 14 * D, 203, 'published', { isSubscriber: true }],

  // Cleopatra
  [38, '@nilequeen', 'Love that you covered how many languages she spoke. She was brilliant.', 3 * 7 * D, 112, 'published', { isSubscriber: true }],

  // How Rome fell
  [32, '@gibbon_reader', 'I NEED a part 2 about the Byzantine Empire. The Eastern Empire lasted another thousand years!', 6 * 7 * D, 1204, 'published', { isSubscriber: true, pinned: true, creatorReply: 'Your wish is granted – the Byzantine Empire episode is already in production 👀', otherReplies: [['@constantinople_1453', 'YES PLEASE. Justinian, Theodora, Basil the Bulgar-Slayer…', 211], ['@ellie.writes', 'Seconding this, the Byzantines never get enough love', 96]] }],
  [32, '@decline_and_fall', 'The point about the Crisis of the Third Century being the real beginning of the end is so underrated.', 6 * 7 * D + 2 * D, 341, 'published', { isSubscriber: true }],
  [32, '@paulgreen', 'This is genuinely one of the best explanations of the Roman Empire I\'ve ever watched.', 7 * 7 * D, 655, 'published', { isSubscriber: true, hearted: true }],

  // Caligula
  [27, '@incitatus_official', 'Me, a horse, watching this video: 👀', 3 * 30 * D, 2210, 'published', { isSubscriber: false, hearted: true }],
  [27, '@roman.coins', 'The seashell story might have been Roman propaganda – Suetonius wasn\'t exactly unbiased. Glad you mentioned that!', 3 * 30 * D + 5 * D, 467, 'published', { isSubscriber: true }],
  [27, '@sleepyhistorian', 'Your voice is so calming. I fall asleep to these every night (in a good way!)', 2 * 30 * D, 302, 'published', { isSubscriber: true }],

  // Black Death
  [22, '@epidemiology_phd', 'Excellent overview. The section on the flagellants and the economic aftermath was particularly well done.', 4 * 30 * D, 980, 'published', { isSubscriber: true }],
  [22, '@medievalmum', 'It\'s wild that labour shortages after the plague gave peasants real bargaining power for the first time.', 4 * 30 * D + 3 * D, 1312, 'published', { isSubscriber: true, otherReplies: [['@econhistory', 'The Statute of Labourers 1351 was literally the government trying to stop wages rising', 402]] }],
  [22, '@grim_reader', 'Half of Europe. I can\'t even imagine. Chilling documentary.', 4 * 30 * D + 10 * D, 588, 'published', { isSubscriber: false }],

  // Mongol Empire
  [13, '@steppewarrior', 'The Mongol messenger system (Yam) section blew my mind. They were centuries ahead of their time logistically.', 5 * 30 * D, 2421, 'published', { isSubscriber: true, hearted: true }],
  [13, '@ulaanbaatar_pride', 'Greetings from Mongolia! Thank you for such a fair and detailed video 🇲🇳', 5 * 30 * D + 8 * D, 3388, 'published', { isSubscriber: true, hearted: true, creatorReply: 'Greetings and thank you for watching! 🇲🇳' }],
  [13, '@feigned_retreat', 'The feigned retreat tactic is just brutal. Lure them in, then encircle. Every. Single. Time.', 6 * 30 * D, 1774, 'published', { isSubscriber: false }],
  [13, '@learnwithlily', 'This video is why I subscribed. Been binge-watching the whole channel since.', 4 * D, 48, 'published', { isSubscriber: true }],

  // Terrifying day in Rome
  [17, '@hannibals_elephant', 'Cannae is still studied in military academies today. Double envelopment perfection.', 5 * 30 * D, 1532, 'published', { isSubscriber: true }],
  [17, '@spqr_ed', 'The animation of the Roman lines collapsing inward was terrifying. Amazing work.', 2 * D + 6 * H, 33, 'published', { isSubscriber: true }],

  // Brutal punishments
  [24, '@darkhistoryclub', 'Not for the faint-hearted but so well researched. The bit about public executions being entertainment is grim.', 3 * 30 * D + 12 * D, 714, 'published', { isSubscriber: true }],

  // Spartans
  [11, '@leonidas_v2', 'Love that you mention the other Greeks who stayed – the Thespians are always forgotten!', 6 * 30 * D, 845, 'published', { isSubscriber: true }],

  // Emu war
  [26, '@aussie_dan', 'As an Australian I\'m both ashamed and proud. Go emus 🦤', 3 * 30 * D + 20 * D, 1904, 'published', { isSubscriber: false, hearted: true }],

  // Atlantis
  [9, '@platonist', 'The Thera eruption theory is the most convincing. Great balance between myth and evidence.', 7 * 30 * D, 621, 'published', { isSubscriber: true }],

  // Egypt
  [12, '@egyptologist_in_training', 'The Harem Conspiracy against Ramesses III is one of history\'s great true crime stories.', 6 * 30 * D + 5 * D, 701, 'published', { isSubscriber: true }],

  // Templar
  [30, '@friday13th', 'Philip IV basically cancelled his debts by destroying an entire order. Medieval finance was ruthless.', 2 * 30 * D + 14 * D, 422, 'published', { isSubscriber: true }],

  // Shorts
  ['s12', '@quickhistory', 'The herbs in the beak were supposed to filter "bad air" – miasma theory. Great short!', 20 * D, 312, 'published', { isSubscriber: false }],
  ['s14', '@emu_enjoyer', 'The emus had more tactical discipline than most armies 😂', 9 * D, 860, 'published', { isSubscriber: false }],
  ['s07', '@zanzibar_fact', '38 minutes and they still had to pay for the shells used. Brutal.', 2 * 30 * D, 655, 'published', { isSubscriber: false }],

  // Held for review
  [46, '@historylinks_hub', 'Great video! I wrote a full article on the Royal Road here: historylinks-hub.example/persia – check it out', 50, 0, 'held'],
  [45, '@quiz_master_44', 'If you liked this, try my free history quiz app – link in my profile 👉', 5 * H, 0, 'held'],
  [44, '@thinkerpaul', 'Honestly the "experts" are lying to you about the pyramids. Look into the Tartaria cover-up, they don\'t want you to know.', 2 * D, 2, 'held'],
  [42, '@user-sp4rk1e', 'nero was the best emperor change my mind!!!! 🔥🔥🔥', 6 * D, 0, 'held'],
  [46, '@angryviewer201', 'This channel is AI garbage. Do your own research.', 11 * H, 1, 'held'],
  [43, '@mystery_tv_channel', 'We covered this too in more depth, see our channel for the REAL answer', 4 * D, 0, 'held'],
  [46, '@curious_kate', 'Is the music from the YouTube audio library? Which track is it?', 15 * H, 0, 'held', { isQuestion: true }],
  [41, '@timeline_tom', 'Sources please? Some of the numbers here don\'t match Josephus.', 9 * D, 3, 'held', { isQuestion: true }],

  // Likely spam
  [46, '@Crypto_Mentor_Alex', 'I made £12,000 last month thanks to Mr. Henderson\'s trading signals 💰 message him on WhatsApp +44 7700 900…', 22, 0, 'spam'],
  [46, '@ThePastExpIained', 'Congratulations 🎉 you have been selected for our giveaway! Message me on Telegram to claim your prize 👉 @PastExplained_Gift', 70, 0, 'spam'],
  [45, '@hot_singles_near', '🔥 Watch my new video, link in bio 🔥🔥', 3 * H, 0, 'spam'],
  [44, '@sub4sub_2026', 'sub4sub?? i subbed to you pls sub back 🙏🙏', 1 * D, 0, 'spam'],
  [44, '@financial_freedom99', 'Who else is watching in 2026? 👇 Also check out the best passive income course, it changed my life', 3 * D, 0, 'spam'],
  [42, '@giftcard-winner', 'FREE £500 Amazon gift card for the first 100 people!!! Visit my channel', 7 * D, 0, 'spam'],
  [43, '@ThePastExpIained', 'Thanks for watching! You have been chosen as one of our lucky winners. Telegram me now.', 5 * D, 0, 'spam'],
  [46, '@movie_streams_hd', 'Watch the full 300 movie free in HD here ➡️ stream-hd.example', 30 * H, 0, 'spam'],
];

const NAMES_FOR_REPLY = ['@ThePastExplained'];

export function buildSeedComments(): StudioComment[] {
  return ROWS.map(([video, handle, text, minutesAgo, likes, status = 'published', extra = {}], i) => {
    const seed = typeof video === 'number' ? LONG_FORM_SEEDS[video] : SHORT_SEEDS[Number(video.slice(1)) - 1];
    const publishedAt = SEEDED_TIMING[seed.id].publishedAt;
    let at = SESSION_START - minutesAgo * MIN;
    if (at < publishedAt) at = publishedAt + (i + 3) * 7 * MIN;
    const { creatorReply, otherReplies, ...rest } = extra;
    const replies: StudioComment['replies'] = [];
    (otherReplies ?? []).forEach(([h, t, l], j) =>
      replies.push({ id: `c${i}-r${j}`, author: h, handle: h, avatarColor: avatarColourFor(h), text: t, at: at + (j + 1) * 47 * MIN, likes: l }),
    );
    if (creatorReply) {
      replies.push({
        id: `c${i}-rc`,
        author: NAMES_FOR_REPLY[0],
        handle: NAMES_FOR_REPLY[0],
        avatarColor: '#1b1b1b',
        text: creatorReply,
        at: Math.min(SESSION_START - 5 * MIN, at + 95 * MIN),
        likes: Math.round(likes * 0.18),
        isCreator: true,
      });
    }
    return {
      id: `c${String(i + 1).padStart(3, '0')}`,
      videoId: seed.id,
      author: handle,
      handle,
      avatarColor: avatarColourFor(handle),
      text,
      at,
      likes,
      isSubscriber: rest.isSubscriber ?? i % 3 !== 0,
      status,
      liked: false,
      disliked: false,
      hearted: false,
      replies,
      ...rest,
    } satisfies StudioComment;
  });
}
