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
      <p>Egerton Connect is a place for adults in the Egerton University community to meet people nearby. You join with a nickname, say which area you are in, add photos and a few things about yourself, and browse other profiles. When you want to talk to someone, you send a chat request. Once they accept, you chat inside the site.</p>
      <h2>How we try to keep it safe and private</h2>
      <ul>
        <li><strong>Nicknames, not real names.</strong> Profiles show a nickname and a general area only.</li>
        <li><strong>No phone number needed.</strong> You never have to give us your phone number to join. What you share in a chat is up to you.</li>
        <li><strong>Photos are checked first.</strong> Every photo is reviewed before other members can see it.</li>
        <li><strong>You choose who to talk to.</strong> A chat only starts when the other person accepts your request.</li>
        <li><strong>Adults only.</strong> Everyone confirms they are 18 or older.</li>
        <li><strong>Report and block.</strong> Every profile and chat has a Report or block option, and blocked people cannot see each other.</li>
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
        <li>Harass, threaten, pressure or abuse anyone.</li>
        <li>Ask other members for money, or run scams.</li>
        <li>Advertise or arrange paid sexual services, or anything else that is illegal.</li>
        <li>Collect other members' details, or copy profiles or photos in bulk.</li>
        <li>Try to break or get around the site's security, photo checks, limits or its blocking features.</li>
      </ul>

      <h2>4. Photos</h2>
      <p>Your main photo must show you. All photos must follow these rules:</p>
      <ul>
        <li>Only you, clothed, with no nudity or sexual content.</li>
        <li>No one under 18, and no weapons or drugs.</li>
        <li>No phone numbers, social media handles or other contact details written on photos.</li>
        <li>Only photos you have the right to use. Do not use someone else's pictures.</li>
      </ul>
      <p>New and changed photos are reviewed before other members can see them. We may reject or remove any photo and will try to say why. A profile appears in Browse once it has an approved photo. Serious or repeated breaches may lead to suspension. Any sexual content involving a minor will be removed immediately and reported to the authorities.</p>

      <h2>5. Chat requests and credits</h2>
      <p>To talk to someone, you send a chat request with one short message. The other person can accept, decline or block you, and you can chat once they accept. Replying to a request is always free.</p>
      <p>Once paid features begin, sending a new request will use one credit. Credits are bought in packs, with the price shown in the app before you pay. A credit is used when you send a request and is not refunded if the request is declined or not answered. A request that is not answered within 10 days disappears, and you can pay again to send a new one. If someone declines, you can ask them again after 30 days. There is a daily limit on how many new requests you can send. Credits are not exchangeable for cash. Payments are not otherwise refundable, except for payment errors or double charges. During testing, sending requests may be free.</p>

      <h2>6. Messages</h2>
      <p>Chat is text only. Do not send unwanted, sexual, threatening or abusive messages, do not ask for money, and do not share anyone else's private information. Messages are not end-to-end encrypted. We store them, and we may read messages that are reported, or when needed to keep people safe or to meet legal requirements. You can report or block anyone from a chat. If you choose to share personal details or move the conversation elsewhere, that is your decision and your responsibility, and we cannot control what happens outside the site. If you delete your account, your messages are deleted.</p>

      <h2>7. Your content</h2>
      <p>You keep ownership of your photos and words. You give us permission to store and show them on the site so the service can work. You promise that you have the right to post them.</p>

      <h2>8. Reports, blocking and removal</h2>
      <p>You can report or block anyone. We may review reports and may remove content, suspend or delete accounts, at our discretion, if we believe these terms have been broken or someone may be at risk. We do not have to give advance notice where safety is a concern.</p>

      <h2>9. Your safety</h2>
      <p>We do not check anyone's identity, age or background beyond what they tell us and what we can see in photos. You are responsible for your own safety when you chat with or meet anyone. Be careful about what you share, choose public places when meeting, and leave any situation that feels wrong.</p>

      <h2>10. No guarantees, and limits on our responsibility</h2>
      <p>The site is provided as it is, and may sometimes be unavailable or contain mistakes. We are not responsible for what members say or do, or for any meetings or relationships that result. To the extent the law allows, we are not liable for losses arising from your use of the site. Nothing in these terms limits any rights you have under Kenyan law that cannot be limited.</p>

      <h2>11. Ending your account</h2>
      <p>You can pause your profile, or delete your account, at any time from the My profile page. We may suspend or end accounts as described above.</p>

      <h2>12. Changes and governing law</h2>
      <p>We may update these terms and will show the date of the latest update. Continuing to use the site means you accept the changes. These terms are governed by the laws of Kenya.</p>

      <h2>13. Contact</h2>
      ${contactLine}`,
  },

  privacy: {
    title: "Privacy Policy",
    html: `
      <p>This policy explains what personal information Egerton Connect collects, why, who can see it, and the choices you have.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account:</strong> your email address and a password (stored in scrambled form, so we cannot read it).</li>
        <li><strong>Profile:</strong> your nickname, gender, who you are interested in, your general area, and optionally what you are looking for, a short bio, prompt answers, interests, "vibe" details such as languages and star sign, and the time you were last active.</li>
        <li><strong>Photos:</strong> the photos you upload and whether each one has been approved. Hidden data inside photos, such as GPS location, is removed.</li>
        <li><strong>Messages:</strong> chat requests and messages you send and receive, with times and read status.</li>
        <li><strong>Credits and payments:</strong> when paid features start, your credit balance and, for each purchase, the M-Pesa number you pay with, the amount and the M-Pesa receipt number. We never see your M-Pesa PIN.</li>
        <li><strong>Safety records:</strong> reports and blocks, and any decisions we make about photos or accounts.</li>
        <li><strong>On your device:</strong> a login session, and small settings such as profiles you saved.</li>
      </ul>
      <p>We do not ask for your real name, your phone number, your age or your exact location to join. If you type personal details into your bio or a chat, they are stored like any other text, so please be careful.</p>

      <h2>Why we use it</h2>
      <p>To run your account, show your profile to other members, check photos, let members send and answer chat requests, handle reports and blocks, keep the site safe, and (when credits start) process payments.</p>

      <h2>Who can see what</h2>
      <ul>
        <li><strong>Other signed-in members:</strong> your nickname, gender, area, what you are looking for, bio, prompts, interests, vibe details, an "active recently" mark, and your approved photos.</li>
        <li><strong>Your email address:</strong> never shown to other members.</li>
        <li><strong>Messages:</strong> only the two people in the chat. We may read reported chats, and may access messages when needed for safety or legal reasons. Messages are not end-to-end encrypted.</li>
        <li><strong>Photos waiting for review, and reports:</strong> only our moderators. The person you report is not told who reported them.</li>
        <li>Profiles are only visible to people who are signed in. We do not sell your information.</li>
      </ul>

      <h2>Services that help us run the site</h2>
      <p>We use Supabase for our database, login and photo storage, with servers in Frankfurt, Germany, and Vercel to host the website. When email sending, automatic photo screening and payments are switched on, an email service, a photo-checking service and a payment provider (such as M-Pesa) will handle the data needed for those tasks, and we will update this page. Because some of these providers are outside Kenya, your information may be processed abroad.</p>

      <h2>How long we keep it</h2>
      <p>We keep your profile while your account exists. When you delete your account from the My profile page, your profile details, photos, messages and login email are deleted. We may keep reports for as long as needed to keep people safe, and payment records for as long as the law requires.</p>

      <h2>Your rights</h2>
      <p>Under Kenya's Data Protection Act you can ask to see, correct or delete your information, and object to how it is used. You can download a copy of your profile information from the My profile page. You can also complain to the Office of the Data Protection Commissioner.</p>

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
