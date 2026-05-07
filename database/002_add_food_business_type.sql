-- Add Local Cafe / Food Shops as a first-class business type.
-- Run this migration before 003_food_section.sql so the enum value is committed
-- before it is used by table defaults, seeds, policies, and inserts.

alter type public.business_type add value if not exists 'food';
