export function safeReturnPath(value: string | null) {
  if (
    !value ||
    value.length > 2000 ||
    /[\\\u0000-\u0020]/.test(value) ||
    !/^\/(spark|dashboard|learn|studio|projects|portfolio|marketplace|settings|achievements|notifications)(?:\/|\?|#|$)/.test(
      value,
    )
  )
    return "/dashboard";
  return value;
}
