import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type BudgetRange = Database['public']['Enums']['budget_range'];

export interface CampaignCardData {
  id: string;
  title: string;
  description: string;
  budget_range: BudgetRange;
  created_at: string;
  brand_name: string;
  industry: string | null;
  brand_avatar_url: string | null;
  deliverables: string[];
}

type RawCampaign = Pick<
  Database['public']['Tables']['campaigns']['Row'],
  'id' | 'title' | 'description' | 'budget_range' | 'created_at'
> & {
  brand_profiles:
    | (Pick<
        Database['public']['Tables']['brand_profiles']['Row'],
        'brand_name' | 'industry'
      > & {
        profiles: Pick<
          Database['public']['Tables']['profiles']['Row'],
          'avatar_url'
        > | null;
      })
    | null;
  campaign_deliverables: Pick<
    Database['public']['Tables']['campaign_deliverables']['Row'],
    'label'
  >[];
};

export async function getCampaigns(filters: {
  budgetRange?: BudgetRange;
}): Promise<CampaignCardData[]> {
  const supabase = await createClient();

  let query = supabase
    .from('campaigns')
    .select(
      `
      id,
      title,
      description,
      budget_range,
      created_at,
      brand_profiles (
        brand_name,
        industry,
        profiles (
          avatar_url
        )
      ),
      campaign_deliverables (
        label
      )
    `,
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters.budgetRange) {
    query = query.eq('budget_range', filters.budgetRange);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Supabase Query Error:', error);
    return [];
  }

  const typedCampaigns = data as unknown as RawCampaign[];

  return typedCampaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    budget_range: campaign.budget_range,
    created_at: campaign.created_at,
    brand_name: campaign.brand_profiles?.brand_name || 'Unknown Brand',
    industry: campaign.brand_profiles?.industry || null,
    brand_avatar_url: campaign.brand_profiles?.profiles?.avatar_url || null,
    deliverables: campaign.campaign_deliverables?.map((d) => d.label) || [],
  }));
}
