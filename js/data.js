/* Meadows Lingo course content (built-in). Admin edits made in the app are stored in the database and merged on top of this. */
const CURRICULUM = [
 {id:"7",label:"Year 7",units:[
  {id:"y7-greetings",en:"Greetings",ar:"التحيات",words:[
   ["مرحبا","marhaban","hello"],["السلام عليكم","as-salāmu ʿalaykum","peace be upon you"],["صباح الخير","ṣabāḥ al-khayr","good morning"],["مساء الخير","masāʾ al-khayr","good evening"],["كيف حالك؟","kayfa ḥāluk?","how are you?"],["اسمي","ismī","my name is"],["أنا من","ana min","I am from"],["مع السلامة","maʿa as-salāma","goodbye"],["شكرا","shukran","thank you"]],
   sentences:[["اسمي سارة وأنا من الهند.","My name is Sara and I am from India."],["صباح الخير يا معلمي.","Good morning, my teacher."],["أنا بخير والحمد لله.","I am fine, thank God."]]},
  {id:"y7-family",en:"Family",ar:"العائلة",words:[
   ["أب","ab","father"],["أم","umm","mother"],["أخ","akh","brother"],["أخت","ukht","sister"],["جد","jadd","grandfather"],["جدة","jadda","grandmother"],["عم","ʿamm","uncle"],["عائلة","ʿāʾila","family"]],
   sentences:[["عائلتي كبيرة.","My family is big."],["أبي مهندس وأمي طبيبة.","My father is an engineer and my mother is a doctor."],["أحب جدي وجدتي كثيرا.","I love my grandfather and grandmother a lot."]]},
  {id:"y7-home",en:"My Home",ar:"بيتي",words:[
   ["بيت","bayt","house"],["غرفة","ghurfa","room"],["مطبخ","maṭbakh","kitchen"],["حمام","ḥammām","bathroom"],["سرير","sarīr","bed"],["كرسي","kursī","chair"],["طاولة","ṭāwila","table"],["باب","bāb","door"]],
   sentences:[["غرفتي كبيرة وجميلة.","My room is big and beautiful."],["الكتاب على الطاولة.","The book is on the table."],["القطة تحت السرير.","The cat is under the bed."]]},
  {id:"y7-area",en:"My Area",ar:"منطقتي",words:[
   ["حي","ḥayy","neighbourhood"],["مسجد","masjid","mosque"],["مستشفى","mustashfā","hospital"],["سوق","sūq","market"],["حديقة","ḥadīqa","park"],["شارع","shāriʿ","street"],["مكتبة","maktaba","library"],["يمين","yamīn","right"]],
   sentences:[["المسجد قريب من بيتي.","The mosque is near my house."],["اذهب يمينا ثم يسارا.","Go right, then left."],["في حيي حديقة كبيرة.","There is a big park in my neighbourhood."]]},
  {id:"y7-school",en:"School Activity",ar:"الأنشطة المدرسية",words:[
   ["مدرسة","madrasa","school"],["فصل","faṣl","classroom"],["كتاب","kitāb","book"],["قلم","qalam","pen"],["دفتر","daftar","notebook"],["طالب","ṭālib","student"],["رياضيات","riyāḍiyyāt","maths"],["علوم","ʿulūm","science"]],
   sentences:[["أحب مادة العلوم.","I love science."],["في حقيبتي كتاب وقلم.","In my bag there is a book and a pen."],["يبدأ اليوم الدراسي في الساعة السابعة.","The school day starts at seven o'clock."]]}
 ]},
 {id:"8",label:"Year 8",units:[
  {id:"y8-freetime",en:"Free Time",ar:"وقت الفراغ",words:[
   ["وقت الفراغ","waqt al-farāgh","free time"],["رياضة","riyāḍa","sport"],["سباحة","sibāḥa","swimming"],["كرة القدم","kurat al-qadam","football"],["يلعب","yalʿab","he plays"],["نادي","nādī","club"],["بعد المدرسة","baʿda al-madrasa","after school"],["أمارس","umāris","I practise"]],
   sentences:[["ألعب كرة القدم بعد المدرسة.","I play football after school."],["في وقت الفراغ أمارس السباحة.","In my free time I go swimming."]]},
  {id:"y8-hobbies",en:"Hobbies",ar:"الهوايات",words:[
   ["هواية","hiwāya","hobby"],["قراءة","qirāʾa","reading"],["رسم","rasm","drawing"],["طبخ","ṭabkh","cooking"],["تصوير","taṣwīr","photography"],["موسيقى","mūsīqā","music"],["أحب","uḥibb","I like"],["ممتع","mumtiʿ","fun"]],
   sentences:[["هوايتي المفضلة هي الرسم.","My favourite hobby is drawing."],["القراءة هواية ممتعة.","Reading is a fun hobby."]]},
  {id:"y8-weekend",en:"Weekend Activities",ar:"أنشطة نهاية الأسبوع",words:[
   ["نهاية الأسبوع","nihāyat al-usbūʿ","weekend"],["السبت","as-sabt","Saturday"],["الأحد","al-aḥad","Sunday"],["أزور","azūr","I visit"],["أصدقاء","aṣdiqāʾ","friends"],["شاطئ","shāṭiʾ","beach"],["مركز تسوق","markaz tasawwuq","mall"],["أخرج","akhruj","I go out"]],
   sentences:[["في يوم السبت أزور جدتي.","On Saturday I visit my grandmother."],["نذهب إلى الشاطئ مع الأصدقاء.","We go to the beach with friends."]]},
  {id:"y8-food",en:"Food and Drink",ar:"الطعام والشراب",words:[
   ["طعام","ṭaʿām","food"],["ماء","māʾ","water"],["عصير","ʿaṣīr","juice"],["أرز","aruzz","rice"],["دجاج","dajāj","chicken"],["حلويات","ḥalawiyyāt","desserts"],["لقيمات","luqaymāt","luqaimat (Emirati sweet dumplings)"],["مطعم","maṭʿam","restaurant"]],
   sentences:[["أريد عصير برتقال من فضلك.","I would like orange juice, please."],["اللقيمات حلوى إماراتية لذيذة.","Luqaimat are a delicious Emirati sweet."],["نأكل الأرز والدجاج على الغداء.","We eat rice and chicken for lunch."]]},
  {id:"y8-healthy",en:"Healthy Lifestyle",ar:"نمط الحياة الصحي",words:[
   ["صحة","ṣiḥḥa","health"],["تمارين","tamārīn","exercises"],["خضروات","khaḍrawāt","vegetables"],["فواكه","fawākih","fruit"],["نوم","nawm","sleep"],["صحي","ṣiḥḥī","healthy"],["نظام غذائي","niẓām ghidhāʾī","diet"],["نشيط","nashīṭ","active"]],
   sentences:[["أنام ثماني ساعات كل ليلة.","I sleep eight hours every night."],["الخضروات والفواكه مفيدة للصحة.","Vegetables and fruit are good for health."]]}
 ]},
 {id:"9",label:"Year 9",units:[
  {id:"y9-clothing",en:"Clothing and Fashion",ar:"الملابس والأزياء",words:[
   ["ملابس","malābis","clothes"],["قميص","qamīṣ","shirt"],["فستان","fustān","dress"],["حذاء","ḥidhāʾ","shoes"],["كندورة","kandūra","kandura (men's robe)"],["عباءة","ʿabāʾa","abaya"],["سعر","siʿr","price"],["غالي","ghālī","expensive"]],
   sentences:[["الكندورة لباس تقليدي في الإمارات.","The kandura is traditional dress in the UAE."],["كم سعر هذا القميص؟","How much is this shirt?"]]},
  {id:"y9-weather",en:"Weather",ar:"الطقس",words:[
   ["طقس","ṭaqs","weather"],["حار","ḥārr","hot"],["بارد","bārid","cold"],["مشمس","mushmis","sunny"],["ممطر","mumṭir","rainy"],["رياح","riyāḥ","winds"],["صيف","ṣayf","summer"],["شتاء","shitāʾ","winter"]],
   sentences:[["الطقس في دبي حار في الصيف.","The weather in Dubai is hot in summer."],["الشتاء في الإمارات معتدل.","Winter in the UAE is mild."]]},
  {id:"y9-education",en:"The World of Education",ar:"عالم التعليم",words:[
   ["امتحان","imtiḥān","exam"],["واجب","wājib","homework"],["يدرس","yadrus","he studies"],["نجاح","najāḥ","success"],["جامعة","jāmiʿa","university"],["مادة","mādda","subject"],["درجة","daraja","grade / mark"],["تخصص","takhaṣṣuṣ","specialisation"]],
   sentences:[["أدرس كل يوم قبل الامتحان.","I study every day before the exam."],["أريد أن أدرس في الجامعة.","I want to study at university."]]},
  {id:"y9-futurejob",en:"Future Job",ar:"وظيفة المستقبل",words:[
   ["وظيفة","waẓīfa","job"],["طبيب","ṭabīb","doctor"],["مهندس","muhandis","engineer"],["طيار","ṭayyār","pilot"],["محامي","muḥāmī","lawyer"],["يعمل","yaʿmal","he works"],["خبرة","khibra","experience"],["راتب","rātib","salary"]],
   sentences:[["أحلم أن أصبح طيارا.","I dream of becoming a pilot."],["الطبيب يعمل في المستشفى.","The doctor works in the hospital."]]},
  {id:"y9-festivals",en:"Festivals",ar:"المهرجانات",words:[
   ["عيد","ʿīd","Eid / festival"],["احتفال","iḥtifāl","celebration"],["اليوم الوطني","al-yawm al-waṭanī","National Day"],["هدية","hadiyya","gift"],["ألعاب نارية","alʿāb nāriyya","fireworks"],["تقاليد","taqālīd","traditions"],["رمضان","ramaḍān","Ramadan"],["مهرجان","mahrajān","festival"]],
   sentences:[["نحتفل باليوم الوطني في الثاني من ديسمبر.","We celebrate National Day on the second of December."],["نشاهد الألعاب النارية في العيد.","We watch fireworks at Eid."]]}
 ]},
 {id:"10",label:"Year 10",units:[
  {id:"y10-globalvillage",en:"Global Village",ar:"القرية العالمية",words:[
   ["القرية العالمية","al-qarya al-ʿālamiyya","Global Village"],["دولة","dawla","country"],["جنسية","jinsiyya","nationality"],["ثقافة","thaqāfa","culture"],["أزياء","azyāʾ","costumes / fashions"],["عرض","ʿarḍ","show / performance"],["زوار","zuwwār","visitors"],["عالمي","ʿālamī","international"]],
   sentences:[["في القرية العالمية أجنحة من دول كثيرة.","Global Village has pavilions from many countries."],["تعرفت على ثقافات مختلفة.","I got to know different cultures."]]},
  {id:"y10-worldtech",en:"World of Technology",ar:"عالم التكنولوجيا",words:[
   ["ألعاب إلكترونية","alʿāb iliktrūniyya","electronic games"],["تطبيق","taṭbīq","app"],["هاتف","hātif","phone"],["شاشة","shāsha","screen"],["إنترنت","intarnit","internet"],["وقت الشاشة","waqt ash-shāsha","screen time"],["حاسوب","ḥāsūb","computer"],["يحمّل","yuḥammil","he downloads"]],
   sentences:[["أستخدم تطبيقا لتعلم اللغة العربية.","I use an app to learn Arabic."],["يجب ألا نقضي وقتا طويلا أمام الشاشة.","We should not spend a long time in front of the screen."]]},
  {id:"y10-travel",en:"Travel & Tourism",ar:"السفر والسياحة",words:[
   ["سفر","safar","travel"],["سائح","sāʾiḥ","tourist"],["طائرة","ṭāʾira","plane"],["مطار","maṭār","airport"],["فندق","funduq","hotel"],["جواز سفر","jawāz safar","passport"],["رحلة","riḥla","trip"],["اقتصاد","iqtiṣād","economy"]],
   sentences:[["سافرت إلى مصر بالطائرة.","I travelled to Egypt by plane."],["السياحة مهمة لاقتصاد الإمارات.","Tourism is important for the UAE economy."]]},
  {id:"y10-relationships",en:"My Family and Relationships",ar:"عائلتي والعلاقات",words:[
   ["علاقة","ʿalāqa","relationship"],["احترام","iḥtirām","respect"],["مسؤولية","masʾūliyya","responsibility"],["يساعد","yusāʿid","he helps"],["سعادة","saʿāda","happiness"],["قيم","qiyam","values"],["والدان","wālidān","parents"],["تعاون","taʿāwun","cooperation"]],
   sentences:[["العائلة مصدر السعادة.","The family is a source of happiness."],["أساعد والديّ في أعمال البيت.","I help my parents with the housework."]]},
  {id:"y10-friends",en:"School Matters and Friends",ar:"أمور المدرسة وتأثير الأصدقاء",words:[
   ["صديق","ṣadīq","friend"],["ضغط الأقران","ḍaghṭ al-aqrān","peer pressure"],["تنمر","tanammur","bullying"],["دافع","dāfiʿ","motivation"],["قرار","qarār","decision"],["مسؤول","masʾūl","responsible"],["ثقة","thiqa","confidence"],["اختيار","ikhtiyār","choice"]],
   sentences:[["الصديق الحقيقي يساعدك على النجاح.","A true friend helps you succeed."],["يجب أن نقول لا للتنمر.","We must say no to bullying."]]},
  {id:"y10-technology",en:"Technology",ar:"التكنولوجيا",words:[
   ["وسائل التواصل الاجتماعي","wasāʾil at-tawāṣul al-ijtimāʿī","social media"],["أمان","amān","safety"],["خصوصية","khuṣūṣiyya","privacy"],["كلمة المرور","kalimat al-murūr","password"],["مزايا","mazāyā","advantages"],["عيوب","ʿuyūb","disadvantages"],["معلومات","maʿlūmāt","information"],["التعلم عن بعد","at-taʿallum ʿan buʿd","distance learning"]],
   sentences:[["لا تشارك كلمة المرور مع أحد.","Do not share your password with anyone."],["لوسائل التواصل الاجتماعي مزايا وعيوب.","Social media has advantages and disadvantages."]]}
 ]},
 {id:"11",label:"Year 11",units:[
  {id:"y11-environment",en:"Environment",ar:"البيئة",words:[
   ["بيئة","bīʾa","environment"],["تلوث","talawwuth","pollution"],["تغير المناخ","taghayyur al-munākh","climate change"],["إعادة التدوير","iʿādat at-tadwīr","recycling"],["طاقة شمسية","ṭāqa shamsiyya","solar energy"],["مستدام","mustadām","sustainable"],["نفايات","nufāyāt","waste"],["يحافظ على","yuḥāfiẓ ʿalā","he preserves"]],
   sentences:[["يجب أن نحافظ على البيئة.","We must protect the environment."],["تستخدم مدينة مصدر الطاقة الشمسية.","Masdar City uses solar energy."]]},
  {id:"y11-healthy",en:"Healthy Lifestyle",ar:"نمط الحياة الصحي",words:[
   ["لياقة بدنية","liyāqa badaniyya","physical fitness"],["تغذية","taghdhiya","nutrition"],["متوازن","mutawāzin","balanced"],["عادات","ʿādāt","habits"],["سكريات","sukkariyyāt","sugars"],["وجبات سريعة","wajabāt sarīʿa","fast food"],["مناعة","manāʿa","immunity"],["ممارسة","mumārasa","practice"]],
   sentences:[["النظام الغذائي المتوازن يقوي المناعة.","A balanced diet strengthens immunity."],["الوجبات السريعة تضر بالصحة.","Fast food harms your health."]]}
 ]},
 {id:"dp",label:"DP / CP",units:[
  {id:"dp-holidays",en:"Holidays, Travel and Tourism",ar:"العطلات والسفر والسياحة",words:[
   ["عطلة","ʿuṭla","holiday"],["وجهة","wijha","destination"],["تجربة","tajriba","experience"],["يستكشف","yastakshif","he explores"],["معالم","maʿālim","landmarks"],["حجز","ḥajz","booking"],["آثار","āthār","historic sites"],["ثقافات","thaqāfāt","cultures"]],
   sentences:[["السفر فرصة لاستكشاف ثقافات جديدة.","Travel is a chance to explore new cultures."],["زرنا المعالم التاريخية في روما.","We visited the historic landmarks in Rome."]]},
  {id:"dp-weatherenv",en:"Weather and Environment",ar:"الطقس والبيئة",words:[
   ["مناخ","munākh","climate"],["فصول السنة","fuṣūl as-sana","seasons"],["درجة الحرارة","darajat al-ḥarāra","temperature"],["رطوبة","ruṭūba","humidity"],["عاصفة","ʿāṣifa","storm"],["جفاف","jafāf","drought"],["يؤثر","yuʾaththir","it affects"],["ارتفاع","irtifāʿ","rise"]],
   sentences:[["يؤثر الطقس على حياتنا اليومية.","The weather affects our daily life."],["ترتفع درجة الحرارة في شهر أغسطس.","The temperature rises in August."]]},
  {id:"dp-tech",en:"The World of Technology",ar:"عالم التكنولوجيا",words:[
   ["ابتكار","ibtikār","innovation"],["ذكاء اصطناعي","dhakāʾ iṣṭināʿī","artificial intelligence"],["مستقبل","mustaqbal","future"],["تواصل","tawāṣul","communication"],["تقنية","taqniyya","technology"],["روبوت","rūbūt","robot"],["بيانات","bayānāt","data"],["يطوّر","yuṭawwir","he develops"]],
   sentences:[["الذكاء الاصطناعي يغير طريقة التعلم.","Artificial intelligence is changing the way we learn."],["التقنية تسهل التواصل بين الناس.","Technology makes communication between people easier."]]}
 ]}
];
const UNITS = {}; CURRICULUM.forEach(y=>y.units.forEach(u=>{u.year=y.id;u.yearLabel=y.label;UNITS[u.id]=u}));
const ALL_WORDS = CURRICULUM.flatMap(y=>y.units.flatMap(u=>u.words.map(w=>({ar:w[0],tr:w[1],en:w[2],unit:u.id}))));

const LEVELS = {
 A:{name:"Level A",desc:"Beginner",years:"1–2 years of Arabic",write:["letters","words"]},
 B:{name:"Level B",desc:"Elementary",years:"3–4 years of Arabic",write:["words","sentences"]},
 C:{name:"Level C",desc:"Intermediate",years:"5–6 years of Arabic",write:["sentences","dictation"]},
 D:{name:"Level D",desc:"Upper intermediate",years:"7–8 years of Arabic",write:["sentences","dictation"]},
 E:{name:"Level E",desc:"Advanced",years:"9+ years of Arabic",write:["dictation","sentences"]}
};
function levelFromYears(y){y=+y||1;return y<=2?"A":y<=4?"B":y<=6?"C":y<=8?"D":"E"}

const LETTERS = [
 ["ا","alif","أسد","lion",0],["ب","bāʾ","باب","door",1],["ت","tāʾ","تفاح","apple",1],["ث","thāʾ","ثعلب","fox",1],["ج","jīm","جمل","camel",1],["ح","ḥāʾ","حليب","milk",1],["خ","khāʾ","خبز","bread",1],
 ["د","dāl","دب","bear",0],["ذ","dhāl","ذهب","gold",0],["ر","rāʾ","رمل","sand",0],["ز","zāy","زيت","oil",0],["س","sīn","سمك","fish",1],["ش","shīn","شمس","sun",1],["ص","ṣād","صقر","falcon",1],
 ["ض","ḍād","ضفدع","frog",1],["ط","ṭāʾ","طائرة","plane",1],["ظ","ẓāʾ","ظرف","envelope",1],["ع","ʿayn","عين","eye",1],["غ","ghayn","غزال","gazelle",1],["ف","fāʾ","فيل","elephant",1],["ق","qāf","قمر","moon",1],
 ["ك","kāf","كتاب","book",1],["ل","lām","ليمون","lemon",1],["م","mīm","مدرسة","school",1],["ن","nūn","نخلة","palm tree",1],["ه","hāʾ","هاتف","phone",1],["و","wāw","وردة","rose",0],["ي","yāʾ","يد","hand",1]
];

/* IBT-style reading passages, one per level */
const PASSAGES = {
 A:{title:"أحمد وعائلته",en:"Ahmed and his family",text:"اسمي أحمد. أنا من باكستان. عمري اثنا عشر عاما. أسكن في دبي مع عائلتي. في عائلتي خمسة أشخاص: أبي وأمي وأختي وأخي وأنا. أبي مهندس وأمي معلمة. بيتنا قريب من المسجد والحديقة. أحب مدرستي كثيرا، ومادتي المفضلة هي العلوم.",
  qs:[{q:"من أين أحمد؟",h:"Where is Ahmed from?",o:["من باكستان","من الهند","من مصر","من دبي"]},
      {q:"كم شخصا في عائلة أحمد؟",h:"How many people are in Ahmed's family?",o:["خمسة","أربعة","ستة","ثلاثة"]},
      {q:"ماذا تعمل أم أحمد؟",h:"What does Ahmed's mother do?",o:["معلمة","طبيبة","مهندسة","طباخة"]},
      {q:"ما مادة أحمد المفضلة؟",h:"What is Ahmed's favourite subject?",o:["العلوم","الرياضيات","الرسم","الرياضة"]},
      {q:"بيت أحمد قريب من...",h:"Ahmed's house is near...",o:["المسجد والحديقة","السوق والمستشفى","المدرسة والمكتبة","الشاطئ"]}]},
 B:{title:"يوم السبت",en:"Saturday",text:"تحب مريم الرياضة كثيرا. في يوم السبت تذهب إلى النادي وتمارس السباحة مع صديقتها ليلى. بعد السباحة تأكلان في مطعم صغير. تطلب مريم دجاجا وأرزا وعصير برتقال، وتطلب ليلى سمكا وسلطة. في المساء ترسم مريم أو تقرأ قصة. تقول مريم: الرياضة والأكل الصحي والنوم الجيد سر الصحة.",
  qs:[{q:"متى تذهب مريم إلى النادي؟",h:"When does Maryam go to the club?",o:["يوم السبت","يوم الأحد","يوم الجمعة","كل يوم"]},
      {q:"ماذا تمارس مريم في النادي؟",h:"What does she do at the club?",o:["السباحة","كرة القدم","التنس","الركض"]},
      {q:"ماذا تطلب ليلى في المطعم؟",h:"What does Layla order?",o:["سمكا وسلطة","دجاجا وأرزا","عصير برتقال","لقيمات"]},
      {q:"ماذا تفعل مريم في المساء؟",h:"What does Maryam do in the evening?",o:["ترسم أو تقرأ قصة","تذهب إلى السوق","تطبخ الطعام","تلعب كرة القدم"]},
      {q:"حسب مريم، سر الصحة هو...",h:"According to Maryam, the secret of health is...",o:["الرياضة والأكل الصحي والنوم الجيد","الحلويات والعصير","مشاهدة التلفاز","السفر كل أسبوع"]}]},
 C:{title:"ديسمبر في الإمارات",en:"December in the UAE",text:"في شهر ديسمبر يكون الطقس في الإمارات جميلا ومعتدلا، لذلك تكثر فيه المهرجانات. في الثاني من ديسمبر يحتفل الناس باليوم الوطني، فيلبس الرجال الكندورة وتلبس النساء العباءة، ويرفعون علم الدولة، ويشاهدون الألعاب النارية. يقول خالد، وهو طالب في الصف التاسع: «أحلم أن أصبح طيارا في المستقبل، وأن أطير بعلم بلادي في سماء العالم». ولذلك يدرس خالد بجد، ويهتم بمادتي الرياضيات والفيزياء.",
  qs:[{q:"لماذا تكثر المهرجانات في شهر ديسمبر؟",o:["لأن الطقس معتدل وجميل","لأن المدارس مغلقة","لأن الطقس حار جدا","لأن الناس يسافرون"]},
      {q:"متى يحتفل الناس باليوم الوطني؟",o:["في الثاني من ديسمبر","في الأول من يناير","في شهر رمضان","في الصيف"]},
      {q:"ماذا يلبس الرجال في اليوم الوطني؟",o:["الكندورة","العباءة","الفستان","القميص والبنطال"]},
      {q:"ما الوظيفة التي يحلم بها خالد؟",o:["طيار","طبيب","مهندس","معلم"]},
      {q:"كلمة «بجد» في النص تعني...",o:["باجتهاد","بسرعة","بحزن","ببطء"]}]},
 D:{title:"الشباب والتكنولوجيا",en:"Young people and technology",text:"أصبحت التكنولوجيا جزءا مهما من حياة الشباب، فهم يستخدمون الهواتف والتطبيقات للتواصل والتعلم واللعب. ولوسائل التواصل الاجتماعي مزايا كثيرة، منها سرعة الحصول على المعلومات والتواصل مع الأصدقاء في كل مكان. لكن لها أيضا عيوبا، مثل التنمر الإلكتروني وقلة النوم وضعف التركيز في الدراسة. لذلك ينصح الخبراء الطلاب بتحديد وقت الشاشة، وعدم مشاركة المعلومات الشخصية أو كلمات المرور، واختيار الأصدقاء بحكمة في العالم الحقيقي والعالم الرقمي.",
  qs:[{q:"من مزايا وسائل التواصل الاجتماعي حسب النص:",o:["سرعة الحصول على المعلومات","قلة النوم","التنمر الإلكتروني","ضعف التركيز"]},
      {q:"من العيوب المذكورة في النص:",o:["ضعف التركيز في الدراسة","التواصل مع الأصدقاء","التعلم","سرعة المعلومات"]},
      {q:"بماذا ينصح الخبراء الطلاب؟",o:["بتحديد وقت الشاشة","بترك الدراسة","بمشاركة كلمات المرور","بشراء هاتف جديد"]},
      {q:"كلمة «بحكمة» تعني...",o:["بعقل وتفكير","بسرعة","بغضب","بلا اهتمام"]},
      {q:"ما الفكرة الرئيسية للنص؟",o:["للتكنولوجيا فوائد ومخاطر ويجب استخدامها بحكمة","التكنولوجيا مضرة دائما","الألعاب أهم من الدراسة","الهواتف غالية الثمن"]}]},
 E:{title:"مدن مستدامة",en:"Sustainable cities",text:"تواجه مدن العالم تحديات بيئية كبيرة، أهمها تلوث الهواء والماء وارتفاع درجات الحرارة بسبب تغير المناخ. وقد اتخذت دولة الإمارات خطوات واضحة لبناء مدن مستدامة، فمدينة مصدر في أبوظبي تعتمد على الطاقة الشمسية، وتشجع على المشي واستخدام وسائل النقل النظيفة. كما تنظم المدارس حملات لإعادة التدوير وتقليل استخدام البلاستيك. ويرى كثير من الشباب أن حماية البيئة ليست مسؤولية الحكومات وحدها، بل هي مسؤولية كل فرد في المجتمع، تبدأ بعادات يومية بسيطة مثل ترشيد استهلاك الماء والكهرباء.",
  qs:[{q:"ما أهم التحديات البيئية المذكورة في النص؟",o:["التلوث وارتفاع درجات الحرارة","قلة السياح","كثرة المدارس","ارتفاع الأسعار"]},
      {q:"على ماذا تعتمد مدينة مصدر؟",o:["الطاقة الشمسية","النفط","الفحم","الغاز فقط"]},
      {q:"ماذا تفعل المدارس لحماية البيئة؟",o:["تنظم حملات لإعادة التدوير","تبني مصانع جديدة","تمنع الطلاب من المشي","تشتري سيارات كثيرة"]},
      {q:"حسب رأي الشباب، حماية البيئة مسؤولية...",o:["كل فرد في المجتمع","الحكومات وحدها","المدارس وحدها","العلماء فقط"]},
      {q:"كلمة «ترشيد» تعني...",o:["تقليل الاستهلاك بحكمة","زيادة الاستهلاك","البيع","الشراء"]}]}
};

/* IBT-style grammar, spelling and vocabulary bank. First option is correct; options are shuffled at run time. */
const BANK = {
 A:[
  {s:"Grammar",q:"أنا ____ الهند.",h:"I am ____ India.",o:["من","في","على","إلى"]},
  {s:"Grammar",q:"هذا ____ كبير.",h:"This is a big ____ (masculine word).",o:["بيتٌ","غرفةٌ","مدرسةٌ","حديقةٌ"]},
  {s:"Grammar",q:"____ أختي.",h:"____ is my sister.",o:["هذه","هذا","هؤلاء","ذلك"]},
  {s:"Grammar",q:"الكتاب ____ الطاولة.",h:"The book is ____ the table.",o:["على","من","عن","مع"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة لكلمة school:",h:"Choose the correct spelling.",o:["مدرسة","مدرسه","مدرصة","مدرسا"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة لكلمة thank you:",h:"Choose the correct spelling.",o:["شكرا","شكرن","شوكرا","شكرة"]},
  {s:"Vocabulary",q:"عكس كلمة «كبير» هو:",h:"The opposite of big is:",o:["صغير","طويل","جميل","جديد"]},
  {s:"Vocabulary",q:"أي كلمة لا تنتمي إلى المجموعة؟",h:"Which word does not belong?",o:["قلم","أب","أم","أخ"]},
  {s:"Vocabulary",q:"نطبخ الطعام في ____.",h:"We cook food in the ____.",o:["المطبخ","الحمام","السرير","الشارع"]},
  {s:"Vocabulary",q:"نصلي في ____.",h:"We pray in the ____.",o:["المسجد","السوق","المطبخ","الحديقة"]}
 ],
 B:[
  {s:"Grammar",q:"أنا ____ كرة القدم كل يوم.",h:"I ____ football every day.",o:["ألعب","يلعب","تلعب","نلعب"]},
  {s:"Grammar",q:"هي ____ الطعام في المطبخ.",h:"She ____ food in the kitchen.",o:["تطبخ","يطبخ","أطبخ","نطبخ"]},
  {s:"Grammar",q:"نحن ____ إلى الشاطئ يوم الأحد.",h:"We ____ to the beach on Sunday.",o:["نذهب","يذهب","أذهب","تذهبين"]},
  {s:"Grammar",q:"جمع كلمة «صديق» هو:",h:"The plural of friend is:",o:["أصدقاء","صداقة","صادق","مصدق"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة لكلمة juice:",h:"Choose the correct spelling.",o:["عصير","عسير","عصيير","أصير"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة لكلمة vegetables:",h:"Choose the correct spelling.",o:["خضروات","خضرواة","خدروات","خضراوت"]},
  {s:"Vocabulary",q:"عكس كلمة «نشيط» هو:",h:"The opposite of active is:",o:["كسلان","سريع","قوي","سعيد"]},
  {s:"Vocabulary",q:"اليوم الذي بعد السبت هو:",h:"The day after Saturday is:",o:["الأحد","الجمعة","الاثنين","الخميس"]},
  {s:"Vocabulary",q:"أشرب ____ في الصباح.",h:"I drink ____ in the morning.",o:["الحليب","الخبز","الأرز","الدجاج"]},
  {s:"Vocabulary",q:"هوايتي ____ لأنني أحب الألوان.",h:"My hobby is ____ because I love colours.",o:["الرسم","السباحة","الطبخ","النوم"]}
 ],
 C:[
  {s:"Grammar",q:"أمس ____ خالد إلى المطار.",o:["ذهب","يذهب","اذهب","سيذهب"]},
  {s:"Grammar",q:"غدا ____ الطقس ممطرا.",o:["سيكون","كان","يكونون","كن"]},
  {s:"Grammar",q:"الطالبة ____.",o:["مجتهدة","مجتهد","مجتهدون","مجتهدين"]},
  {s:"Grammar",q:"أريد أن ____ طبيبا في المستقبل.",o:["أصبح","أصبحت","يصبح","صار"]},
  {s:"Grammar",q:"نحتفل باليوم الوطني ____ الثاني من ديسمبر.",o:["في","على","عن","إلى"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة:",o:["جامعة","جامعه","جمعاة","جامعت"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة:",o:["امتحان","إمتحان","امتهان","امتحن"]},
  {s:"Vocabulary",q:"مرادف كلمة «حار» هو:",o:["ساخن","بارد","ممطر","معتدل"]},
  {s:"Vocabulary",q:"أي كلمة لا تنتمي إلى المجموعة؟",o:["قميص","صيف","شتاء","ربيع"]},
  {s:"Vocabulary",q:"الشخص الذي يقود الطائرة هو:",o:["الطيار","المحامي","الطبيب","المهندس"]}
 ],
 D:[
  {s:"Grammar",q:"يجب ألا ____ كلمة المرور مع أحد.",o:["نشارك","نشاركوا","مشاركة","شاركنا"]},
  {s:"Grammar",q:"الطلاب ____ في المكتبة الآن.",o:["يدرسون","يدرس","تدرس","ندرس"]},
  {s:"Grammar",q:"إنّ التنمرَ سلوكٌ ____.",o:["خاطئٌ","خاطئاً","خاطئةٌ","خاطئين"]},
  {s:"Grammar",q:"أحب الألعاب الإلكترونية، ____ ألعب ساعة واحدة فقط.",o:["لكنني","لأن","إذا","حتى"]},
  {s:"Grammar",q:"سافر أبي ____ لندن الأسبوع الماضي.",o:["إلى","على","عن","مع"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة:",o:["الاجتماعي","الإجتماعي","الاجتماعى","الأجتماعي"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة:",o:["إلكترونية","الكترونيه","إلكترونيت","ألكترونية"]},
  {s:"Vocabulary",q:"عكس كلمة «مزايا» هو:",o:["عيوب","فوائد","معلومات","أفكار"]},
  {s:"Vocabulary",q:"المقصود بـ «ضغط الأقران» هو:",o:["تأثير الأصدقاء على قراراتنا","ضغط الدراسة","ضغط الوقت","مساعدة المعلمين"]},
  {s:"Vocabulary",q:"المكان الذي ينام فيه السائح أثناء السفر:",o:["الفندق","المطار","الجواز","الاقتصاد"]}
 ],
 E:[
  {s:"Grammar",q:"يجب أن ____ على البيئة.",o:["نحافظَ","نحافظُ","حافظنا","محافظة"]},
  {s:"Grammar",q:"الطالبان ____ في مسابقة إعادة التدوير.",o:["شاركا","شاركوا","شارك","شاركت"]},
  {s:"Grammar",q:"الطالبة ____ فازت بالجائزة من صفنا.",o:["التي","الذي","الذين","اللذان"]},
  {s:"Grammar",q:"ازداد التلوث ____ كثرة السيارات.",o:["بسبب","رغم","حول","دون"]},
  {s:"Grammar",q:"كلما زاد استخدام البلاستيك، ____ التلوث.",o:["زاد","قلّ","انتهى","توقف"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة:",o:["إعادة التدوير","اعادة التدوير","إعاده التدوير","أعادة التدوير"]},
  {s:"Spelling",q:"اختر الكتابة الصحيحة:",o:["مسؤولية","مسأولية","مسوولية","مسؤليه"]},
  {s:"Vocabulary",q:"معنى كلمة «مستدام» هو:",o:["يستمر طويلا دون أن يضر البيئة","قديم جدا","سريع الانتهاء","غالي الثمن"]},
  {s:"Vocabulary",q:"عكس كلمة «ارتفاع» هو:",o:["انخفاض","زيادة","صعود","نمو"]},
  {s:"Vocabulary",q:"الذكاء الاصطناعي من مجالات:",o:["التقنية","الزراعة","الطبخ","الرياضة"]}
 ]
};

const ACTIVITIES = {
 vocab:{en:"Meaning quiz",needsUnit:true,desc:"Match Arabic words to their meaning"},
 listen:{en:"Listening quiz",needsUnit:true,desc:"Hear a word, choose how it is written"},
 words:{en:"Word builder",needsUnit:true,desc:"Spell words from letter tiles"},
 sentence:{en:"Sentence builder",needsUnit:true,desc:"Put words in the right order"},
 dictation:{en:"Dictation",needsUnit:true,desc:"Listen and type the word"},
 reading:{en:"Reading",needsUnit:false,desc:"Read a passage and answer questions"},
 ibt:{en:"IBT practice test",needsUnit:false,desc:"Mixed reading, grammar, spelling and vocabulary"}
};


/* ---------- admin content edits ----------
   Units saved by the admin in the database override the built-in unit with the same id,
   or are added as new units. A unit saved with hidden:true is removed from the course. */
const BUILTIN_CURRICULUM = JSON.parse(JSON.stringify(CURRICULUM));
function rebuildContentIndex(){
 for(const k of Object.keys(UNITS))delete UNITS[k];
 CURRICULUM.forEach(y=>y.units.forEach(u=>{u.year=y.id;u.yearLabel=y.label;UNITS[u.id]=u}));
 ALL_WORDS.length=0;
 CURRICULUM.forEach(y=>y.units.forEach(u=>u.words.forEach(w=>ALL_WORDS.push({ar:w[0],tr:w[1],en:w[2],unit:u.id}))));
}
function unitFromDoc(d){
 return {id:d.id,en:d.en||"Untitled unit",ar:d.ar||"",custom:true,
  words:(d.words||[]).filter(w=>w&&w.ar&&w.en).map(w=>[w.ar,w.tr||"",w.en]),
  sentences:(d.sentences||[]).filter(s=>s&&s.ar).map(s=>[s.ar,s.en||""])};
}
function applyContent(docs){
 CURRICULUM.forEach(y=>{const b=BUILTIN_CURRICULUM.find(x=>x.id===y.id);y.units=b?JSON.parse(JSON.stringify(b.units)):[]});
 (docs||[]).slice().sort((a,b)=>(a.order??999)-(b.order??999)).forEach(d=>{
  const y=CURRICULUM.find(x=>x.id===d.year);if(!y||!d.id)return;
  CURRICULUM.forEach(yy=>{const i=yy.units.findIndex(u=>u.id===d.id);if(i>=0&&(yy!==y||d.hidden))yy.units.splice(i,1)});
  if(d.hidden)return;
  const u=unitFromDoc(d);if(u.words.length<5||!u.sentences.length)return;
  const i=y.units.findIndex(x=>x.id===d.id);if(i>=0)y.units[i]=u;else y.units.push(u);
 });
 // never leave a year empty
 CURRICULUM.forEach(y=>{if(!y.units.length){const b=BUILTIN_CURRICULUM.find(x=>x.id===y.id);if(b)y.units.push(JSON.parse(JSON.stringify(b.units[0])))}});
 rebuildContentIndex();
}
