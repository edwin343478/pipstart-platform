export const CONFIRMATION_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

interface ConfirmationSearchParams {
  getAll(name: string): string[];
}

export function readConfirmationToken(
  searchParams: ConfirmationSearchParams,
): string | null {
  const tokens = searchParams.getAll("token");

  if (tokens.length !== 1 || !CONFIRMATION_TOKEN_PATTERN.test(tokens[0])) {
    return null;
  }

  return tokens[0];
}
