import type { DentexgoConversation } from "@/lib/dentexgo/conversations";

/**
 * Resolve the URL that opens a conversation for a staff member.
 *
 * Dentexgo does the hard part: it maps the PSID to a Meta Graph thread id
 * (`t_…`) server-side and hands us both that id and a ready-made
 * `messenger_deep_link` into Meta Business Suite. We hold no Page Access Token
 * and make no Graph calls.
 *
 * The contract flags `messenger_deep_link` as an UNOFFICIAL url — Meta may
 * change its shape without notice — and recommends building your own from
 * `messenger_thread_id` for long-term stability. Hence the template override:
 * when Meta breaks the shape, the fix is an env change, not a deploy.
 *
 * There is no mobile-app deep link. Per the contract the URL opens Meta
 * Business Suite on the web; a phone may hand it to the Business Suite app via
 * universal links, but that is not guaranteed and must not be promised in the
 * UI. A PSID is NOT a thread id, so `fb-messenger://` and `messenger.com/t/`
 * variants would not resolve and are deliberately absent.
 */
export function threadUrl(
  conversation: Pick<
    DentexgoConversation,
    "messenger_thread_id" | "messenger_deep_link"
  >,
): string | null {
  const threadId = conversation.messenger_thread_id;
  if (!threadId) return null;

  const template = process.env.MESSENGER_DEEP_LINK_TEMPLATE;
  if (template) {
    return template
      .replaceAll("{threadId}", encodeURIComponent(threadId))
      .replaceAll("{pageId}", encodeURIComponent(process.env.FACEBOOK_PAGE_ID ?? ""));
  }

  return conversation.messenger_deep_link;
}
