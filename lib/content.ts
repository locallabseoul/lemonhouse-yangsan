export type HomepageHero = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  background_image_url: string;
  primary_label: string;
  primary_href: string;
  secondary_label: string;
  secondary_href: string;
  updated_at: string | null;
};

export type SitePortfolioItem = {
  id: string;
  created_at: string;
  title: string;
  apartment: string;
  size: "20평대" | "30평대" | "40평대 이상";
  style: string;
  image_url: string;
  description: string;
  sort_order: number;
  is_published: boolean;
};

export type PortfolioPayload = Omit<SitePortfolioItem, "id" | "created_at">;
