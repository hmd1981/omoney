export const PROFILE_PLACEHOLDER_FIRST = 'OMoney';
export const PROFILE_PLACEHOLDER_LAST = 'User';
export const PROFILE_PLACEHOLDER_COUNTRY = 'Unknown';

export function normalizeProfilePart(value?: string | null) {
  return value?.trim() ?? '';
}

export function splitDisplayName(name?: string) {
  const full = normalizeProfilePart(name);
  if (!full) return { firstName: '', lastName: '' };
  const parts = full.split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

export function resolveSocialNames(input: {
  givenName?: string;
  familyName?: string;
  name?: string;
}) {
  let firstName = normalizeProfilePart(input.givenName);
  let lastName = normalizeProfilePart(input.familyName);
  if (!firstName && input.name) {
    const split = splitDisplayName(input.name);
    firstName = split.firstName;
    lastName = lastName || split.lastName;
  }
  return { firstName, lastName };
}

export function isUserProfileComplete(
  profile?: { firstName: string; lastName: string; country: string } | null
) {
  if (!profile) return false;
  const firstName = normalizeProfilePart(profile.firstName);
  const lastName = normalizeProfilePart(profile.lastName);
  const country = normalizeProfilePart(profile.country);
  if (firstName.length < 2 || firstName === PROFILE_PLACEHOLDER_FIRST) return false;
  if (lastName.length < 2 || lastName === PROFILE_PLACEHOLDER_LAST) return false;
  if (!country || country === PROFILE_PLACEHOLDER_COUNTRY) return false;
  return true;
}
