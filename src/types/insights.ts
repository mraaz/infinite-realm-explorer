
import { InsightColorKey } from '@/utils/colorTheme';
import { IconKey } from '@/utils/iconMapper';

export interface InsightBackContent {
  title: string;
  content: string;
}

export interface Insight {
  title: string;
  description: string;
  icon: IconKey;
  color: InsightColorKey;
  backContent: InsightBackContent;
}
