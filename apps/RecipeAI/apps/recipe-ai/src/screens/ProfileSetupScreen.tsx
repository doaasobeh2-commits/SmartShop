/**
 * Deferred to a later product-profile phase keyed by household_member_id.
 * Not used in the active Phase 4 enrollment flow.
 */
export function ProfileSetupScreen(_props: { onContinue: () => void }) {
  return (
    <div className="p-8 text-sm text-slate-600">
      Profile setup is deferred until the product-profile phase.
    </div>
  );
}
