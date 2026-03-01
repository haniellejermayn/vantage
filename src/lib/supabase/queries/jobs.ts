import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type BudgetRange = Database['public']['Enums']['budget_range'];

export interface JobCardData {
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

type RawJobPost = Pick<
  Database['public']['Tables']['job_posts']['Row'],
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
  job_post_deliverables: Pick<
    Database['public']['Tables']['job_post_deliverables']['Row'],
    'label'
  >[];
};

export async function getJobs(filters: {
  budgetRange?: BudgetRange;
}): Promise<JobCardData[]> {
  const supabase = await createClient();

  let query = supabase
    .from('job_posts')
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
      job_post_deliverables (
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

  const typedJobs = data as unknown as RawJobPost[];

  return typedJobs.map((job) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    budget_range: job.budget_range,
    created_at: job.created_at,
    brand_name: job.brand_profiles?.brand_name || 'Unknown Brand',
    industry: job.brand_profiles?.industry || null,
    brand_avatar_url: job.brand_profiles?.profiles?.avatar_url || null,
    deliverables: job.job_post_deliverables?.map((d) => d.label) || [],
  }));
}
