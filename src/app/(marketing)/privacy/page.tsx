import { Link } from "@/components/link";
import { LegalArticle } from "@/components/legal/legal-article";

export default function PrivacyPage() {
  return (
    <LegalArticle title="Privacy Policy" updated="June 13, 2026">
      <p>
        This Privacy Policy explains what information CVMaker (the &ldquo;Service&rdquo;) collects, how we
        use it, and the choices you have. By using the Service, you agree to the practices described here.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> your email address, name, and authentication details (passwords
          are stored only as salted hashes; two-factor secrets are encrypted).
        </li>
        <li>
          <strong>Resume content:</strong> the CV documents and files you create or upload.
        </li>
        <li>
          <strong>Session and device data:</strong> IP address, user agent, and device labels used to
          show your active sessions and to secure your account.
        </li>
        <li>
          <strong>Usage data:</strong> basic logs needed to operate and improve the Service.
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>To provide core features: editing, autosaving, rendering, and exporting your CVs.</li>
        <li>To publish a public share page and its downloadable files when you opt in.</li>
        <li>To authenticate you, manage sessions, and protect against abuse.</li>
        <li>To communicate about your account (for example, email verification or password resets).</li>
      </ul>

      <h2>3. Public profiles and employer search</h2>
      <p>
        When you choose to share a CV publicly, the information on it becomes accessible to anyone with the
        link and may be indexed by search engines and made discoverable to employers using talent-search
        features. Information in private CVs is never included. You control what you publish and can make a
        CV private again at any time.
      </p>

      <h2>4. Storage and processing</h2>
      <p>
        Your data is stored with our infrastructure providers (database, cache, and file storage). Private
        files are kept in a private store; only files for CVs and assets you explicitly share are copied to
        a public store. We retain your data while your account is active.
      </p>

      <h2>5. Sharing with third parties</h2>
      <p>
        We do not sell your personal information. We share data only with service providers that help us
        operate the Service (such as hosting, email delivery, and payment processing) and as required by
        law.
      </p>

      <h2>6. Your choices and rights</h2>
      <ul>
        <li>Access and update your profile from your account settings.</li>
        <li>Revoke active sessions on any device at any time.</li>
        <li>Disable public sharing to remove public copies of a CV.</li>
        <li>Delete a CV or your account to remove the associated data.</li>
      </ul>

      <h2>7. Security</h2>
      <p>
        We use industry-standard measures including hashed passwords, encrypted secrets, token rotation,
        and session controls. No method of transmission or storage is completely secure, so we cannot
        guarantee absolute security.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about your privacy or this policy? Review our <Link href="/terms">Terms of Service</Link>{" "}
        or contact us through the Service.
      </p>

      <p className="!mt-10 text-xs">
        This document is a starting template and does not constitute legal advice. Have it reviewed by
        qualified counsel before relying on it.
      </p>
    </LegalArticle>
  );
}
