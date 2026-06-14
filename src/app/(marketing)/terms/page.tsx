import { Link } from "@/components/link";
import { LegalArticle } from "@/components/legal/legal-article";

export default function TermsPage() {
  return (
    <LegalArticle title="Terms of Service" updated="June 13, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of CVMaker
        (the &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these
        Terms. If you do not agree, do not use the Service.
      </p>

      <h2>1. Accounts</h2>
      <p>
        You are responsible for safeguarding your account credentials and for all activity under your
        account. You must provide accurate information and promptly update it as needed. You must be at
        least 16 years old to use the Service.
      </p>

      <h2>2. Your content</h2>
      <p>
        You retain all rights to the resume content, files, and other materials you create or upload
        (&ldquo;Your Content&rdquo;). You grant CVMaker a limited licence to host, process, render, and
        display Your Content solely to operate and provide the Service — for example, generating PDF and
        DOCX exports or rendering a public share page when you choose to publish a CV.
      </p>

      <h2>3. Public sharing</h2>
      <p>
        When you make a CV public, anyone with the link can view and download it, and search engines may
        index it. You are responsible for the information you choose to publish. You can disable sharing
        at any time, after which we remove the public copies on a best-effort basis.
      </p>

      <h2>4. Acceptable use</h2>
      <ul>
        <li>Do not upload unlawful, infringing, or harmful content.</li>
        <li>Do not misrepresent your identity or another person&rsquo;s credentials.</li>
        <li>Do not attempt to disrupt, reverse engineer, or gain unauthorized access to the Service.</li>
        <li>Do not use automated means to scrape or harvest data from the Service without permission.</li>
      </ul>

      <h2>5. Paid plans and employer access</h2>
      <p>
        Some features — including employer access to search a talent database of publicly shared
        profiles — may require a paid subscription. Fees, billing cycles, and plan limits will be
        disclosed at the point of purchase. Paid features are subject to any additional terms presented
        at checkout.
      </p>

      <h2>6. Availability and changes</h2>
      <p>
        The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We may
        modify, suspend, or discontinue features at any time. We may update these Terms; material changes
        will be communicated through the Service, and continued use constitutes acceptance.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, CVMaker shall not be liable for any indirect, incidental,
        or consequential damages, or for any loss of data, profits, or goodwill arising from your use of
        the Service.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about these Terms? See our <Link href="/privacy">Privacy Policy</Link> or contact us
        through the Service.
      </p>

      <p className="!mt-10 text-xs">
        This document is a starting template and does not constitute legal advice. Have it reviewed by
        qualified counsel before relying on it.
      </p>
    </LegalArticle>
  );
}
