export type LegalConfiguration = {
  operator: string;
  address: string;
  privacyContact: string;
  complete: boolean;
};

export function getLegalConfiguration(
  environment: Record<string, string | undefined> = process.env,
): LegalConfiguration {
  const operator = environment.NEXT_PUBLIC_LEGAL_OPERATOR?.trim() ?? "";
  const address = environment.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() ?? "";
  const privacyContact = environment.NEXT_PUBLIC_PRIVACY_CONTACT?.trim() ?? "";
  return {
    operator,
    address,
    privacyContact,
    complete: Boolean(operator && address && privacyContact),
  };
}
