export type ReviewKeyword = {
  text: string
  count: number
}

export type VideoContent = {
  url: string
  title: string
  date?: string
}

export type ArticleContent = {
  url: string
  title: string
  date?: string
  platform: "naver" | "other"
}

export type Doctor = {
  id: string
  slug: string
  name: string
  hospital: string
  location: string
  district: string
  region: "서울" | "경기" | "인천" | "기타"
  specialties: string[]
  keywords: string[]
  targetPatients: string[]
  bio: string
  hours: { day: string; time: string }[]
  lunchBreak?: string
  closedDays?: string
  videos: VideoContent[]
  articles: ArticleContent[]
  kakaoUrl?: string
  websiteUrl?: string
  treatments: string[]
  reviewKeywords: ReviewKeyword[]
  photoPlaceholderColor: string
}

export const doctors: Doctor[] = [
  {
    id: "1",
    slug: "topnp",
    name: "한경호",
    hospital: "탑 정신건강의학과의원",
    location: "서울 강남구 강남대로 408 YBM강남센터 12층",
    district: "강남구",
    region: "서울",
    specialties: ["성인ADHD", "성격장애", "스트레스", "불면증", "우울증", "공황장애"],
    keywords: ["지지적인", "격려하는", "현실적 조언"],
    targetPatients: ["직장인", "LGBTQ+", "여성"],
    bio: "경청과 격려, 칭찬을 통해 환자가 스스로의 힘을 발견하도록 돕습니다. 전문적인 지식과 따뜻한 접근으로 함께 나아갑니다.",
    hours: [
      { day: "월·화·목·금", time: "10:00 – 19:00" },
      { day: "수", time: "10:00 – 21:00" },
      { day: "토", time: "10:00 – 14:00" },
    ],
    lunchBreak: "13:00 – 14:00",
    closedDays: "일요일, 공휴일",
    videos: [
      { url: "https://youtu.be/r0MepMxC8EQ", title: "ADHD 의사의 ADHD 치료기", date: "2020-06-03" },
    ],
    articles: [
      { url: "https://blog.naver.com/doctorhkh", title: "가스라이팅과 분노 조절", platform: "naver" },
    ],
    kakaoUrl: "http://pf.kakao.com/_topnp",
    treatments: ["Saxenda"],
    reviewKeywords: [
      { text: "경청해주셔서 마음이 따뜻해졌습니다", count: 28 },
      { text: "전문 분야 지식이 뛰어나요", count: 24 },
      { text: "직원분들이 친절해요", count: 22 },
    ],
    photoPlaceholderColor: "#D4895A",
  },
  {
    id: "2",
    slug: "snsp",
    name: "이홍의",
    hospital: "선릉쉼표 정신건강의학과의원",
    location: "서울 강남구 테헤란로 337 환안타워 15층",
    district: "강남구",
    region: "서울",
    specialties: ["성인ADHD", "불면증", "강박장애", "공황장애", "우울증", "스트레스", "치매"],
    keywords: ["명쾌한", "설명 잘하는", "현실적 조언"],
    targetPatients: ["직장인"],
    bio: "명쾌한 설명과 체계적인 분석으로 문제의 본질을 함께 찾아갑니다. 과학적 근거를 바탕으로 한 치료를 제공합니다.",
    hours: [
      { day: "월–금", time: "10:00 – 19:30" },
      { day: "토", time: "10:00 – 14:30" },
    ],
    lunchBreak: "13:30 – 14:30",
    closedDays: "일요일, 공휴일",
    videos: [
      { url: "https://youtu.be/VyFH09q_Q9c", title: "건망증으로 치부하지 마라! 성인ADHD", date: "2023-01-10" },
    ],
    articles: [
      { url: "https://blog.naver.com/snsp", title: "우울증 극복법", date: "2023-07", platform: "naver" },
      { url: "https://blog.naver.com/snsp", title: "스트레스 관련 증상들", date: "2023-06", platform: "naver" },
    ],
    treatments: ["qEEG", "HRV", "심리검사"],
    reviewKeywords: [
      { text: "공감하며 경청해주십니다", count: 31 },
      { text: "전문 분야 지식이 뛰어나요", count: 27 },
      { text: "직원분들이 친절해요", count: 25 },
    ],
    photoPlaceholderColor: "#7BA8A5",
  },
  {
    id: "3",
    slug: "urmindclinic",
    name: "권순재",
    hospital: "당신의 정신건강의학과의원",
    location: "서울 서초구 강남대로 359 대우도씨에빛2 207호",
    district: "서초구",
    region: "서울",
    specialties: ["우울증", "공황장애", "성인ADHD"],
    keywords: ["공감적인", "명쾌한", "지지적인"],
    targetPatients: ["대학생", "직장인", "임원·고위직"],
    bio: "환자 한 분 한 분의 이야기에 귀 기울이며 공감과 명쾌한 설명으로 함께 나아갑니다.",
    hours: [
      { day: "월·화", time: "10:00 – 19:00" },
      { day: "수·목", time: "13:00 – 20:00" },
      { day: "토 (격주)", time: "10:00 – 14:00" },
    ],
    lunchBreak: "14:00 – 15:00",
    closedDays: "일요일, 공휴일",
    videos: [
      { url: "https://www.youtube.com/watch?v=3G5MIJfery0", title: "스트레스 해소와 휴식 Part 1", platform: "youtube" } as VideoContent,
      { url: "https://www.youtube.com/watch?v=fKBLOE3BEOY", title: "스트레스 해소와 휴식 Part 2", platform: "youtube" } as VideoContent,
    ],
    articles: [
      { url: "https://blog.naver.com/again_mind/222707278234", title: "관계를 독하게 만드는 것들", date: "2022-04", platform: "naver" },
    ],
    treatments: ["HRV"],
    reviewKeywords: [
      { text: "경청해주셔서 마음이 따뜻해졌습니다", count: 32 },
      { text: "전문 분야 지식이 뛰어나요", count: 23 },
      { text: "직원분들이 친절해요", count: 25 },
    ],
    photoPlaceholderColor: "#C9956A",
  },
  {
    id: "4",
    slug: "oneulclinic1",
    name: "양용준",
    hospital: "오늘 정신건강의학과의원",
    location: "서울 용산구 한강대로 69 푸르지오 써밋 2층 205-206호",
    district: "용산구",
    region: "서울",
    specialties: ["ADHD", "비만", "스트레스", "틱장애", "성인ADHD", "우울증", "공황장애"],
    keywords: ["경청하는", "현실적 조언", "분석적인"],
    targetPatients: ["임원·고위직", "연예·스포츠인", "운동선수"],
    bio: "다양한 분야의 환자분들과 함께하며 개인 맞춤형 치료를 제공합니다. 경청과 현실적 조언으로 삶의 질을 높여드립니다.",
    hours: [
      { day: "월–금", time: "10:00 – 20:00" },
      { day: "토", time: "10:00 – 14:00" },
    ],
    lunchBreak: "14:00 – 15:00",
    closedDays: "일요일, 공휴일",
    videos: [
      { url: "https://www.youtube.com/shorts/JhgG17RH0p0", title: "사랑에 빠질 때 뇌에서 일어나는 일", date: "2023" },
    ],
    articles: [
      { url: "https://blog.naver.com/oneulclinic", title: "우울증에 대한 오해와 이해", date: "2020", platform: "naver" },
    ],
    kakaoUrl: "http://pf.kakao.com/_oneul",
    websiteUrl: "https://oneulclinic.net",
    treatments: ["심리검사", "Saxenda", "Spravato"],
    reviewKeywords: [
      { text: "친절하게 상담해주세요", count: 29 },
      { text: "상담 시간이 충분했어요", count: 31 },
      { text: "예약제라서 만족스러워요", count: 26 },
    ],
    photoPlaceholderColor: "#9B7EA8",
  },
  {
    id: "5",
    slug: "yschaeum",
    name: "김지민",
    hospital: "연세채움 정신건강의학과의원",
    location: "서울 강남구 테헤란로 339 서능빌딩 8층",
    district: "강남구",
    region: "서울",
    specialties: ["우울증", "불면증", "ADHD", "공황장애", "강박장애", "스트레스", "알코올"],
    keywords: ["지지적인", "공감적인", "설명 잘하는"],
    targetPatients: ["성인", "아동·청소년"],
    bio: "전문적인 지식과 설명으로 동반자가 되어 드립니다. 아동부터 성인까지 맞춤형 치료를 제공합니다.",
    hours: [
      { day: "월·화·금", time: "10:00 – 19:00" },
      { day: "수 (저녁)", time: "15:00 – 20:00" },
      { day: "토 (2·4주)", time: "10:00 – 14:00" },
    ],
    lunchBreak: "14:00 – 15:00",
    closedDays: "목요일, 일요일, 공휴일",
    videos: [],
    articles: [
      { url: "https://blog.naver.com/yschaeum", title: "분노 조절 가이드", date: "2023-02-21", platform: "naver" },
      { url: "https://blog.naver.com/yschaeum", title: "피해망상과 편집성", date: "2022-04-29", platform: "naver" },
    ],
    websiteUrl: "https://yschaeum.com",
    treatments: ["심리검사", "HRV", "MHSQ"],
    reviewKeywords: [
      { text: "상담 시간이 충분했어요", count: 22 },
      { text: "예약제라서 만족스러워요", count: 28 },
      { text: "친절하게 상담해주세요", count: 33 },
    ],
    photoPlaceholderColor: "#E8845C",
  },
  {
    id: "6",
    slug: "sinsayeon",
    name: "김연진",
    hospital: "신사연 정신건강의학과의원",
    location: "서울 강남구 논현동 1-2 BK빌딩 11층",
    district: "강남구",
    region: "서울",
    specialties: ["ADHD", "우울증", "공황장애", "불면증", "행동중독", "성격장애"],
    keywords: ["공감적인", "설명 잘하는", "현실적 조언"],
    targetPatients: ["직장인", "임원·고위직", "LGBTQ+"],
    bio: "공감적 경청과 분석적 대화로 문제의 근본 원인을 찾아 해결책을 제시합니다.",
    hours: [
      { day: "월·화", time: "12:00 – 20:00" },
      { day: "수·금", time: "10:00 – 18:00" },
      { day: "토", time: "10:00 – 14:00" },
    ],
    lunchBreak: "13:30 – 14:30",
    closedDays: "목요일, 일요일, 공휴일",
    videos: [],
    articles: [
      { url: "https://blog.naver.com/sinsayeon/222984597367", title: "경계선 성격장애 이해하기", platform: "naver" },
    ],
    kakaoUrl: "http://pf.kakao.com/_tHxdzG/chat",
    websiteUrl: "https://sinsayeon.modoo.at",
    treatments: ["qEEG", "HRV", "Saxenda"],
    reviewKeywords: [
      { text: "전문 분야 지식이 뛰어나요", count: 33 },
      { text: "현실적인 조언이 도움됐어요", count: 27 },
      { text: "친절하게 상담해주세요", count: 25 },
    ],
    photoPlaceholderColor: "#6BA8A0",
  },
  {
    id: "7",
    slug: "ddcmind",
    name: "김윤석",
    hospital: "서울맑은 정신건강의학과의원",
    location: "경기 동두천시 중앙로 126 생연프라자 3층",
    district: "동두천시",
    region: "경기",
    specialties: ["우울증", "불면증", "불안장애", "성인ADHD", "성격장애", "공황장애", "스트레스"],
    keywords: ["지지적인", "격려하는", "현실적 조언"],
    targetPatients: ["임원·고위직", "외국인"],
    bio: "칭찬과 격려를 통해 정신적 안정과 삶의 질 향상을 함께 만들어 갑니다.",
    hours: [
      { day: "월·화·수·금", time: "09:00 – 19:00" },
      { day: "목", time: "14:30 – 20:30" },
      { day: "토 (격주)", time: "09:00 – 14:00" },
    ],
    lunchBreak: "13:00 – 14:00",
    closedDays: "일요일, 공휴일",
    videos: [],
    articles: [
      { url: "https://blog.naver.com/ddcmind/222390389243", title: "물질이 건강에 미치는 영향", date: "2021-06", platform: "naver" },
    ],
    treatments: ["TMS", "tDCS"],
    reviewKeywords: [
      { text: "전문 분야 지식이 뛰어나요", count: 28 },
      { text: "경청해주셔서 마음이 따뜻해졌습니다", count: 26 },
      { text: "직원분들이 친절해요", count: 29 },
    ],
    photoPlaceholderColor: "#A07EB5",
  },
  {
    id: "8",
    slug: "familywellnessclinc",
    name: "김신형",
    hospital: "온가족정신건강의학과의원",
    location: "서울 송파구 송파대로 345 헬리오시티 3층 3003호",
    district: "송파구",
    region: "서울",
    specialties: ["우울증", "공황장애", "불안장애", "양극성장애", "PTSD", "아동·청소년 ADHD", "틱장애"],
    keywords: ["경청하는", "공감적인", "분석적인"],
    targetPatients: ["전 연령대"],
    bio: "attentive listening과 공감적 분석으로 맞춤형 치료를 제공합니다. 환자의 성장을 함께 지원합니다.",
    hours: [
      { day: "월·화·수·금", time: "10:00 – 19:00" },
      { day: "토", time: "10:00 – 14:00" },
    ],
    lunchBreak: "13:00 – 14:00",
    closedDays: "목요일, 일요일, 공휴일",
    videos: [],
    articles: [],
    websiteUrl: "https://familywellnessclinc.modoo.at",
    treatments: ["HRV"],
    reviewKeywords: [
      { text: "친절하게 상담해주세요", count: 27 },
      { text: "상담 시간이 충분했어요", count: 28 },
      { text: "예약제라서 만족스러워요", count: 22 },
    ],
    photoPlaceholderColor: "#D4895A",
  },
  {
    id: "9",
    slug: "mindstay",
    name: "박충만",
    hospital: "마음지기 정신건강의학과의원",
    location: "경기 안양시 동안구 평촌대로 223길 64 3동 306호",
    district: "안양시",
    region: "경기",
    specialties: ["우울증", "공황장애", "불안장애", "불면증", "스트레스", "성인ADHD", "양극성장애", "강박장애"],
    keywords: ["지지적인", "경청하는", "명쾌한 설명"],
    targetPatients: ["중장년", "노년", "커플"],
    bio: "진심을 다해 경청하고 명쾌한 설명으로 문제의 원인을 찾아 해결책을 제시합니다.",
    hours: [
      { day: "월·화·수·금", time: "09:30 – 18:30" },
      { day: "목·토", time: "10:00 – 14:30" },
    ],
    lunchBreak: "13:30 – 14:30",
    closedDays: "일요일, 공휴일",
    videos: [],
    articles: [
      { url: "https://blog.naver.com/mindstay22/223031742146", title: "마음지기 블로그", platform: "naver" },
    ],
    websiteUrl: "https://mindstay.modoo.at",
    treatments: ["HRV"],
    reviewKeywords: [
      { text: "직원분들이 친절해요", count: 26 },
      { text: "전문 분야 지식이 뛰어나요", count: 24 },
      { text: "경청해주셔서 마음이 따뜻해졌습니다", count: 25 },
    ],
    photoPlaceholderColor: "#7BAA7D",
  },
  {
    id: "10",
    slug: "yschaeum2",
    name: "윤혜진",
    hospital: "연세채움 정신건강의학과의원",
    location: "서울 강남구 테헤란로 339 서능빌딩 8층",
    district: "강남구",
    region: "서울",
    specialties: ["우울증", "불면증", "공황장애", "불안장애", "강박장애", "스트레스", "알코올"],
    keywords: ["경청하는", "공감적인", "현실적 조언"],
    targetPatients: ["직장인", "여성"],
    bio: "경청과 공감을 바탕으로 현실적인 조언을 드립니다. 여성 정신건강에 특별한 관심을 갖고 있습니다.",
    hours: [
      { day: "월·화·목", time: "10:00 – 19:00" },
      { day: "토 (2·4주)", time: "10:00 – 14:00" },
    ],
    lunchBreak: "14:00 – 15:00",
    closedDays: "수요일, 금요일, 일요일, 공휴일",
    videos: [],
    articles: [
      { url: "https://blog.naver.com/yschaeum2", title: "기분장애와 항우울제 이야기", platform: "naver" },
    ],
    treatments: ["HRV"],
    reviewKeywords: [
      { text: "친절하게 상담해주세요", count: 26 },
      { text: "상담 시간이 충분했어요", count: 23 },
      { text: "경청해주셔서 마음이 따뜻해졌습니다", count: 29 },
    ],
    photoPlaceholderColor: "#C9956A",
  },
  {
    id: "11",
    slug: "magok-mind",
    name: "안인영",
    hospital: "마곡 정신건강의학과의원",
    location: "서울 강서구 마곡중앙로 161-17 보타닉파크타워 1동 4층 401호",
    district: "강서구",
    region: "서울",
    specialties: ["우울증", "공황장애", "불안장애", "불면증", "강박장애", "스트레스", "알코올"],
    keywords: ["지지적인", "공감적인", "명쾌한 설명"],
    targetPatients: ["대학생", "직장인", "중장년"],
    bio: "더 나은 삶을 위한 길잡이가 되어 공감적 경청과 전문적 안내로 함께합니다.",
    hours: [
      { day: "월·화·수·금", time: "10:00 – 19:00" },
      { day: "목", time: "10:00 – 14:00" },
      { day: "토", time: "09:00 – 13:00" },
    ],
    lunchBreak: "13:30 – 14:30",
    closedDays: "일요일, 공휴일",
    videos: [],
    articles: [],
    websiteUrl: "https://www.magok-mind.com",
    treatments: ["TMS", "HRV"],
    reviewKeywords: [
      { text: "친절하게 상담해주세요", count: 25 },
      { text: "상담 시간이 충분했어요", count: 27 },
      { text: "예약제라서 만족스러워요", count: 32 },
    ],
    photoPlaceholderColor: "#7BA8A5",
  },
  {
    id: "12",
    slug: "oneulclinic1-2",
    name: "김수영",
    hospital: "오늘 정신건강의학과의원",
    location: "서울 용산구 한강대로 69 용산푸르지오써밋",
    district: "용산구",
    region: "서울",
    specialties: ["우울증", "공황장애", "성인ADHD"],
    keywords: ["지지적인", "경청하는", "공감적인"],
    targetPatients: ["대학생", "직장인", "여성"],
    bio: "경청과 공감으로 환자분의 이야기에 귀 기울입니다. 따뜻한 마음으로 함께 치료해 나갑니다.",
    hours: [
      { day: "월–목", time: "10:00 – 19:00" },
      { day: "금", time: "10:00 – 14:00" },
    ],
    lunchBreak: "14:00 – 15:00",
    closedDays: "주말, 공휴일",
    videos: [],
    articles: [],
    websiteUrl: "https://oneulclinic.net",
    treatments: ["TMS", "HRV", "심리검사"],
    reviewKeywords: [
      { text: "경청해주셔서 마음이 따뜻해졌습니다", count: 30 },
      { text: "친절하게 상담해주세요", count: 22 },
      { text: "상담 시간이 충분했어요", count: 24 },
    ],
    photoPlaceholderColor: "#E8845C",
  },
  {
    id: "13",
    slug: "drkidari-2",
    name: "최용원",
    hospital: "금천키다리 정신건강의학과의원",
    location: "서울 금천구 시흥대로 403 셈프레팜 9층",
    district: "금천구",
    region: "서울",
    specialties: ["우울증", "불면증", "공황장애", "성인ADHD", "스트레스", "강박장애"],
    keywords: ["따뜻한", "공감적인", "현실적 조언"],
    targetPatients: ["대학생", "직장인", "중장년"],
    bio: "따뜻하고 공감적으로, 필요할 때는 현실적인 안내로 함께 나아갑니다.",
    hours: [
      { day: "월·수·금", time: "09:00 – 18:30" },
      { day: "목", time: "12:00 – 20:00" },
      { day: "토 (격주)", time: "09:00 – 13:00" },
    ],
    lunchBreak: "12:30 – 14:00",
    closedDays: "화요일, 공휴일",
    videos: [],
    articles: [],
    websiteUrl: "https://drkidari.modoo.at",
    treatments: ["심리검사", "HRV"],
    reviewKeywords: [
      { text: "상담 시간이 충분했어요", count: 35 },
      { text: "경청해주셔서 마음이 따뜻해졌습니다", count: 39 },
      { text: "전문 분야 지식이 뛰어나요", count: 42 },
    ],
    photoPlaceholderColor: "#9B7EA8",
  },
  {
    id: "14",
    slug: "facetimepsy",
    name: "이상헌",
    hospital: "국군구리병원",
    location: "경기 구리시 인창2로 177",
    district: "구리시",
    region: "경기",
    specialties: ["우울증", "공황장애", "PTSD"],
    keywords: ["지지적인", "격려하는", "현실적 조언"],
    targetPatients: ["군인", "군 장교"],
    bio: "밝은 에너지로 정서적 지지와 현실적 조언을 제공합니다. 특히 군 관련 정신건강 문제에 전문성을 갖고 있습니다.",
    hours: [
      { day: "월–금", time: "09:00 – 16:00" },
    ],
    closedDays: "주말, 공휴일",
    videos: [
      { url: "https://youtu.be/mindiet", title: "지중해식 MIND 다이어트", date: "2023-06-16" },
      { url: "https://youtu.be/alcohol", title: "음주 중단 전략", date: "2023-02-11" },
    ],
    articles: [],
    websiteUrl: "https://medcmd.mil.kr",
    treatments: ["TMS", "심리검사", "Spravato"],
    reviewKeywords: [
      { text: "따뜻한 분위기예요", count: 28 },
      { text: "상담 시간이 충분했어요", count: 25 },
      { text: "만족스러운 치료였어요", count: 30 },
    ],
    photoPlaceholderColor: "#6BA8A0",
  },
  {
    id: "15",
    slug: "drkidari",
    name: "이다원",
    hospital: "금천키다리 정신건강의학과의원",
    location: "서울 금천구 시흥대로 403 셈프레팜 9층",
    district: "금천구",
    region: "서울",
    specialties: ["우울증", "불면증", "공황장애", "성인ADHD"],
    keywords: ["지지적인", "현실적 조언", "명쾌한 설명"],
    targetPatients: ["직장인", "중장년"],
    bio: "경청과 현실적인 해결책으로 함께 나아갑니다. 특히 불면증과 성인 ADHD에 깊은 전문성을 갖고 있습니다.",
    hours: [
      { day: "월·화·목·금", time: "09:00 – 18:30" },
      { day: "토 (격주)", time: "09:00 – 13:00" },
    ],
    lunchBreak: "12:30 – 14:00",
    closedDays: "수요일, 일요일, 공휴일",
    videos: [],
    articles: [],
    websiteUrl: "https://drkidari.modoo.at",
    treatments: ["심리검사", "HRV"],
    reviewKeywords: [
      { text: "친절하게 상담해주세요", count: 28 },
      { text: "현실적인 조언이 도움됐어요", count: 29 },
      { text: "같은 날 예약 가능해요", count: 32 },
    ],
    photoPlaceholderColor: "#D4895A",
  },
]

export const allSpecialties = [
  "성인ADHD", "우울증", "불면증", "공황장애", "불안장애",
  "강박장애", "스트레스", "성격장애", "알코올", "PTSD",
  "양극성장애", "틱장애", "비만", "치매",
]

export const allRegions = ["서울", "경기", "인천"]

export const allDistricts = [
  "강남구", "서초구", "용산구", "송파구", "강서구", "금천구", "안양시", "동두천시", "구리시",
]

export function getDoctorBySlug(slug: string): Doctor | undefined {
  return doctors.find((d) => d.slug === slug)
}

export const videos = [
  {
    url: "https://youtu.be/r0MepMxC8EQ",
    title: "ADHD 의사의 ADHD 치료기",
    doctor: "한경호",
    hospital: "탑 정신건강의학과의원",
    date: "2020-06-03",
    doctorSlug: "topnp",
  },
  {
    url: "https://youtu.be/VyFH09q_Q9c",
    title: "건망증으로 치부하지 마라! 성인ADHD",
    doctor: "이홍의",
    hospital: "선릉쉼표 정신건강의학과의원",
    date: "2023-01-10",
    doctorSlug: "snsp",
  },
  {
    url: "https://www.youtube.com/watch?v=3G5MIJfery0",
    title: "스트레스 해소와 휴식 Part 1",
    doctor: "권순재",
    hospital: "당신의 정신건강의학과의원",
    doctorSlug: "urmindclinic",
  },
  {
    url: "https://www.youtube.com/watch?v=fKBLOE3BEOY",
    title: "스트레스 해소와 휴식 Part 2",
    doctor: "권순재",
    hospital: "당신의 정신건강의학과의원",
    doctorSlug: "urmindclinic",
  },
  {
    url: "https://www.youtube.com/shorts/JhgG17RH0p0",
    title: "사랑에 빠질 때 뇌에서 일어나는 일",
    doctor: "양용준",
    hospital: "오늘 정신건강의학과의원",
    date: "2023",
    doctorSlug: "oneulclinic1",
  },
]

export const articles = [
  {
    url: "https://blog.naver.com/again_mind/222707278234",
    title: "관계를 독하게 만드는 것들",
    doctor: "권순재",
    hospital: "당신의 정신건강의학과의원",
    date: "2022-04",
    doctorSlug: "urmindclinic",
    platform: "naver" as const,
  },
  {
    url: "https://blog.naver.com/sinsayeon/222984597367",
    title: "경계선 성격장애 이해하기",
    doctor: "김연진",
    hospital: "신사연 정신건강의학과의원",
    doctorSlug: "sinsayeon",
    platform: "naver" as const,
  },
  {
    url: "https://blog.naver.com/ddcmind/222390389243",
    title: "물질이 건강에 미치는 영향",
    doctor: "김윤석",
    hospital: "서울맑은 정신건강의학과의원",
    date: "2021-06",
    doctorSlug: "ddcmind",
    platform: "naver" as const,
  },
  {
    url: "https://blog.naver.com/mindstay22/223031742146",
    title: "마음을 지키는 생활 습관",
    doctor: "박충만",
    hospital: "마음지기 정신건강의학과의원",
    doctorSlug: "mindstay",
    platform: "naver" as const,
  },
  {
    url: "https://blog.naver.com/yschaeum",
    title: "분노 조절 가이드",
    doctor: "김지민",
    hospital: "연세채움 정신건강의학과의원",
    date: "2023-02-21",
    doctorSlug: "yschaeum",
    platform: "naver" as const,
  },
]
