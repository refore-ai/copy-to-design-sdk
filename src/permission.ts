export async function getPermission(permission: string) {
  try {
    // @ts-ignore
    const result = await navigator.permissions.query({ name: permission });
    return result.state;
  } catch {
    // not-support means no user configurable permission in current browser, like safari
    return 'not-support';
  }
}
