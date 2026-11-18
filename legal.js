/* Plain-language draft of the About, Terms and Privacy pages.
   Have a lawyer review these before launch. Set CONTACT_EMAIL to a real support address. */

const CONTACT_EMAIL = "";

const contactLine = CONTACT_EMAIL
  ? `<p>Email us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`
  : `<p>You can reach us at any time through the <strong>Report or block</strong> option in the app.</p>`;

const LEGAL = {
  about: {
    title: "About Egerton Connect",
    html: `
      <p>Egerton Connect is a place for adults in the Egerton University community to meet people nearby. You join with a nickname, say which area you are in, add photos if you like, and browse other profiles. When you want to reach someone, you unlock their contact number and get in touch yourself. There is no chat inside the site.</p>
      <h2>How we try to keep it safe and private</h2>
      <ul>
        <li><strong>Nicknames, not real names.</strong> Profiles show a nickname and a general area only.</li>
        <li><strong>Private numbers.</strong> A phone number stays hidden until someone unlocks it.</li>
        <li><strong>Photos under your control.</strong> You can blur your photos and switch the blur on or off at any time.</li>
        <li><strong>Adults only.</strong> Everyone confirms they are 18 or older.</li>
        <li><strong>Report and block.</strong> Every profile has a Report or block option, and blocked people cannot see each other.</li>
      </ul>
      <h2>Contact</h2>
      ${contactLine}`,
  },

  terms: {
    title: "Terms of Use",
    html: `
      <p>By creating an account or using Egerton Connect, you agree to these terms. If you do not agree, please do not use the site.</p>

      <h2>1. Who can use it</h2>
      <p>You must be 18 or older. By signing up you confirm that you are. Egerton Connect is meant for the Egerton University community. We may remove any account that we believe belongs to someone under 18.</p>

      <h2>2. Your account</h2>
      <ul>
        <li>Give an email address you control and keep your password private.</li>
        <li>Use one account only, and keep your details honest.</li>
        <li>Choose a nickname. You do not need to use your real name.</li>
        <li>You are responsible for what happens under your account.</li>
      </ul>

      <h2>3. What you may not do</h2>
      <ul>
        <li>Pretend to be someone else, or create fake or misleading profiles.</li>
        <li>Post photos of other people without their permission, or any photo of a person under 18.</li>
        <li>Harass, threaten, pressure or abuse anyone.</li>
        <li>Ask other users for money, or run scams.</li>
        <li>Advertise or arrange paid sexual services, or anything else that is illegal.</li>
        <li>Collect other users' details, or copy profiles, photos or phone numbers in bulk.</li>
        <li>Try to break or get around the site's security or its blocking and privacy features.</li>
      </ul>

      <h2>4. Contact unlocking</h2>
      <p>Unlocking lets you see another person's phone number so you can contact them yourself. Unlocking does not mean the person will reply. Contact access may become a paid feature. If it does, the price and what you get will be shown to you before you pay. Please use numbers only to contact the person in a respectful way, and do not share them with anyone else.</p>

      <h2>5. Your content</h2>
      <p>You keep ownership of your photos and words. You give us permission to store and show them on the site so the service can work. You promise that you have the right to post them.</p>

      <h2>6. Reports, blocking and removal</h2>
      <p>You can report or block anyone. We may review reports and may remove content, suspend or delete accounts, at our discretion, if we believe these terms have been broken or someone may be at risk. We do not have to give advance notice where safety is a concern.</p>

      <h2>7. Your safety</h2>
      <p>We do not check anyone's identity, age or background beyond what they tell us. You are responsible for your own safety when you contact or meet anyone. Be careful about what you share, choose public places when meeting, and leave any situation that feels wrong.</p>

      <h2>8. No guarantees, and limits on our responsibility</h2>
      <p>The site is provided as it is, and may sometimes be unavailable or contain mistakes. We are not responsible for what users say or do, or for any meetings or relationships that result. To the extent the law allows, we are not liable for losses arising from your use of the site. Nothing in these terms limits any rights you have under Kenyan law that cannot be limited.</p>

      <h2>9. Ending your account</h2>
      <p>You can delete your profile at any time from the My profile page. We may suspend or end accounts as described above.</p>

      <h2>10. Changes and governing law</h2>
      <p>We may update these terms and will show the date of the latest update. Continuing to use the site means you accept the changes. These terms are governed by the laws of Kenya.</p>

      <h2>11. Contact</h2>
      ${contactLine}`,
  },

  privacy: {
    title: "Privacy Policy",
    html: `
      <p>This policy explains what personal information Egerton Connect collects, why, who can see it, and the choices you have.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account:</strong> your email address and a password (stored in scrambled form, so we cannot read it).</li>
        <li><strong>Profile:</strong> your nickname, gender, who you are interested in, your general area, and optionally a short bio and interests.</li>
        <li><strong>Photos:</strong> any photos you upload, plus an automatically blurred copy of each. Hidden data inside photos, such as GPS location, is removed.</li>
        <li><strong>Contact number:</strong> the phone or WhatsApp number you give us.</li>
        <li><strong>Activity:</strong> which contacts you unlock, your reports and blocks, and your photo blur setting.</li>
        <li><strong>On your device:</strong> a login session, and small settings such as profiles you saved, kept in your browser.</li>
      </ul>
      <p>We do not collect your age. We only ask you to confirm that you are 18 or older.</p>

      <h2>Why we use it</h2>
      <p>To run your account, show your profile to other members, let people unlock contacts, handle reports and blocks, keep the site safe, and (when payments start) process payments.</p>

      <h2>Who can see what</h2>
      <ul>
        <li><strong>Other signed-in members:</strong> your nickname, gender, area, bio, interests and photos (blurred copies if you chose blur, until they unlock your contact).</li>
        <li><strong>Your contact number:</strong> only people who unlock it. It is never shown to anyone else.</li>
        <li><strong>Your email address:</strong> never shown to other members.</li>
        <li><strong>Reports:</strong> private to us. The person you report is not told who reported them.</li>
        <li>Profiles are only visible to people who are signed in. We do not sell your information.</li>
      </ul>

      <h2>Services that help us run the site</h2>
      <p>We use Supabase for our database, login and photo storage, with servers in Frankfurt, Germany, and Vercel to host the website. When email sending and payments are switched on, an email service and a payment provider (such as M-Pesa) will also handle the data needed for those tasks. Because some of these providers are outside Kenya, your information may be processed abroad.</p>

      <h2>How long we keep it</h2>
      <p>We keep your profile while your account exists. When you delete your profile from the My profile page, your profile details, photos and contact number are deleted. Your login email stays until you ask us to remove it. We may keep reports for as long as needed to keep people safe.</p>

      <h2>Your rights</h2>
      <p>Under Kenya's Data Protection Act you can ask to see, correct or delete your information, and object to how it is used. You can also complain to the Office of the Data Protection Commissioner.</p>

      <h2>Under 18s</h2>
      <p>Egerton Connect is for adults only. If we learn that someone under 18 has an account, we will remove it.</p>

      <h2>Security</h2>
      <p>We use access rules, private storage for photos and scrambled passwords to protect your information, but no online service can be completely secure.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date at the top of this page.</p>

      <h2>Contact</h2>
      ${contactLine}`,
  },
};
