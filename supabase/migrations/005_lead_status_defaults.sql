-- Run after 004_production_hardening.sql so the enum value 'sent' is committed first.

alter table public.whatsapp_booking_leads
  alter column status set default 'sent'::public.lead_status;

alter table public.whatsapp_order_leads
  alter column status set default 'sent'::public.lead_status;
