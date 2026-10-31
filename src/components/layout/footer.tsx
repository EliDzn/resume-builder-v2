import { useState } from "react";
import Modal from "@/components/ui/modal";

export default function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="w-full border-t border-foreground bg-background py-2 text-center text-caption font-medium text-foreground">
        <button
          className="underline hover:cursor-pointer"
          onClick={() => setPrivacyOpen(true)}
        >
          Data Privacy
        </button>
      </footer>

      <Modal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title="Data Privacy"
      >
        <p>
          Resume information is stored in your browser using IndexedDB. Certain
          features may transmit relevant information to third-party services for
          processing.
        </p>

        <section>
          <h3 className="font-semibold">IndexedDB – local storage</h3>
          <p>
            Resume edits are stored in IndexedDB in this browser on this device.
            They remain there until you clear them in the app or clear this
            site’s browser data. PDF and DOCX files are read in your browser
            when imported.
          </p>
        </section>

        <section>
          <h3 className="font-semibold">Google Gemini – AI processing</h3>
          <p>
            When you request AI insights, the job description and selected
            resume details are sent to the app server and forwarded to Google
            Gemini. These details include your target role, summary, experience
            roles and bullets, project names, technology stacks and bullets,
            certification titles, and skills. Contact details, company names,
            and dates are not included in this request. Google’s handling
            depends on the service and account terms used.
          </p>
        </section>

        <section>
          <h3 className="font-semibold">Upstash Redis – temporary caching</h3>
          <p>
            Redis supports request limits, concurrency protection, and caching.
            Identical AI requests may reuse a cached response for up to 10
            minutes. Quota counters expire after 24 hours. The app uses a hashed
            IP address in quota keys; Preview and Production use separate key
            namespaces.
          </p>
        </section>

        <section>
          <h3 className="font-semibold">Vercel – hosting and infrastructure</h3>
          <p>
            Vercel hosts the app and its server-side API. Requests pass through
            its infrastructure, which may process operational data under
            Vercel’s terms and policies.
          </p>
        </section>

        <section>
          <h3 className="font-semibold">Data retention and deletion</h3>
          <p>
            Clear resume data in the app or clear this site’s browser data to
            remove locally stored resume information. Redis cache entries expire
            after 10 minutes, quota counters after 24 hours, and concurrency
            locks after up to 60 seconds. Clearing browser data does not delete
            information already sent to Gemini or records retained by service
            providers under their policies.
          </p>
        </section>

        <section>
          <h3 className="font-semibold">Security measures</h3>
          <p>
            The app keeps AI credentials on the server, validates AI requests,
            limits successful generations by IP, and uses concurrency controls.
            IP addresses used in Redis quota keys are hashed. No online service
            can guarantee absolute security.
          </p>
        </section>

        <section>
          <h3 className="font-semibold">Your privacy rights</h3>
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, or object to certain uses of personal information. Local
            resume data can be cleared using the controls above. For requests
            about information processed by the app or its providers, contact the
            app operator using the contact method published with the app. Rights
            and provider responses depend on applicable law and service terms.
          </p>
        </section>
      </Modal>
    </>
  );
}
