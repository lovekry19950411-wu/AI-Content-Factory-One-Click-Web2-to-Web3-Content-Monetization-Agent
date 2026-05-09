export interface Topic {
  id: string;
  title: string;
  platform: string;
  category: string;
  score: number;
  summary: string;
  analysis: string;
  monetization: string;
  tags: string[];
  timestamp: string;
}

export const MOCK_TOPICS: Topic[] = [
  {
    id: "1",
    title: "斷親式社交正在流行：不合群，反而成了年輕人的情緒自救",
    platform: "xiaohongshu",
    category: "emotional",
    score: 89,
    timestamp: "05/09 02:44",
    summary: "「斷親關係內耗」「減少無效社交」「低能量人群自保」成為高頻討論，因為年輕人越來越重視邊界感，把減少消耗看作情緒管理的一部分。",
    analysis: "這個話題火，源於現實壓力與社交疲憊的疊加。用戶從過去追求高頻社交，轉向追求穩定、舒適、低負擔的人際模式。尤其在職場、同學群、親戚關係和曖昧關係中，很多人開始公開討論「如何禮貌疏遠」「如何拒絕別人」「如何不解釋」。這種內容天然容易引發站隊和分享，評論區也常出現高密度真實案例。目標受眾主要是 95 後、00 後都市青年、社交疲憊者、討好型人格用戶。",
    monetization: "可結合情緒成長課程、邊界感訓練營、人際溝通課、書單推薦、耳機、宅家療癒產品、獨處場景零食、家居香氛等帶貨；也適合引流到私域做社群陪伴和諮詢。",
    tags: ["斷親式社交", "邊界感", "人際關係", "情緒自救", "減少內耗"]
  },
  {
    id: "2",
    title: "高敏感人格不是矯情：越來越多人開始重新認識自己",
    platform: "xiaohongshu",
    category: "emotional",
    score: 91,
    timestamp: "05/09 02:44",
    summary: "對聲音敏感、對他人情緒敏感、容易內耗，這些高敏感特徵正從「心理缺陷」轉變為「天賦」。",
    analysis: "高敏感群體在現代城市的高壓環境中極易產生孤獨感。當有人能用細膩的文字描述出他們的內心世界時，會產生極強的心理認同。",
    monetization: "心理諮詢產品、在線課程和志願者活動贊助進行變現。",
    tags: ["高敏感", "心理健康", "內耗", "天賦"]
  },
  {
    id: "3",
    title: "職場斷捨離：如何優雅地退出不再適合的環境",
    platform: "douyin",
    category: "career",
    score: 85,
    timestamp: "05/09 03:01",
    summary: "不再為瑣碎的辦公室政治消耗，專注於個人技能的提升。",
    analysis: "職場倦怠（Burnout）是目前非常大眾的話題，年輕人對「躺平」和「精緻優化」有強烈興趣。",
    monetization: "個人成長及相關書籍推薦、付費諮詢等方式進行變現。",
    tags: ["職場", "成長", "工作"]
  }
];
