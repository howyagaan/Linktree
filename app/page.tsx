"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const retailers = [
  ["USA", "https://wwnorton.com/books/9781682689691", "🇺🇸"],
  ["UK", "https://www.amazon.co.uk/dp/1682689697?ref=cm_sw_r_ffobk_cp_ud_dp_4NJA8Y6AY4T43XR76VN9&ref_=cm_sw_r_ffobk_cp_ud_dp_4NJA8Y6AY4T43XR76VN9&social_share=cm_sw_r_ffobk_cp_ud_dp_4NJA8Y6AY4T43XR76VN9&bestFormat=true&previewDoh=1", "🇬🇧"],
  ["Australia", "https://www.amazon.com.au/dp/1682689697?ref=cm_sw_r_ffobk_cp_ud_dp_MV678Z1NX0AF047KWD49&ref_=cm_sw_r_ffobk_cp_ud_dp_MV678Z1NX0AF047KWD49&social_share=cm_sw_r_ffobk_cp_ud_dp_MV678Z1NX0AF047KWD49&skipTwisterOG=1&bestFormat=true&newOGT=1", "🇦🇺"],
  ["New Zealand", "https://www.thenile.co.nz/books/nicholas-hamilton/sipsy-doozy-100-respectfully-crafted-cocktails-for-the-hom/9781682689691?srsltid=AfmBOor8T28p3xfXCLVPzY48ljZnQFWcF7ducipJq6RakYuMGZwGb9cb", "🇳🇿"],
  ["Canada", "https://www.indigo.ca/products/sipsy-doozy?searchTerm=9781682689691&searchType=products", "🇨🇦"],
  ["Germany", "https://www.amazon.de/dp/1682689697?ref=cm_sw_r_ffobk_cp_ud_dp_4BWPQCFA0QCKNJMQ14ED_2&ref_=cm_sw_r_ffobk_cp_ud_dp_4BWPQCFA0QCKNJMQ14ED_2&social_share=cm_sw_r_ffobk_cp_ud_dp_4BWPQCFA0QCKNJMQ14ED_2&bestFormat=true&previewDoh=1", "🇩🇪"],
  ["France", "https://www.amazon.fr/dp/1682689697?ref=cm_sw_r_ffobk_cp_ud_dp_7V29WTRG9W5E6D5AKWN2_1&ref_=cm_sw_r_ffobk_cp_ud_dp_7V29WTRG9W5E6D5AKWN2_1&social_share=cm_sw_r_ffobk_cp_ud_dp_7V29WTRG9W5E6D5AKWN2_1&bestFormat=true&previewDoh=1", "🇫🇷"],
  ["Spain", "https://www.amazon.es/dp/1682689697?ref=cm_sw_r_ffobk_cp_ud_dp_DNB6TADAFEF8BN98Y9HG&ref_=cm_sw_r_ffobk_cp_ud_dp_DNB6TADAFEF8BN98Y9HG&social_share=cm_sw_r_ffobk_cp_ud_dp_DNB6TADAFEF8BN98Y9HG&bestFormat=true&previewDoh=1", "🇪🇸"],
  ["Italy", "https://www.amazon.it/dp/1682689697?ref=cm_sw_r_ffobk_cp_ud_dp_TQG4VTP14SQSG1JFQWF9&ref_=cm_sw_r_ffobk_cp_ud_dp_TQG4VTP14SQSG1JFQWF9&social_share=cm_sw_r_ffobk_cp_ud_dp_TQG4VTP14SQSG1JFQWF9&bestFormat=true&previewDoh=1", "🇮🇹"],
  ["Japan", "https://www.amazon.co.jp/dp/1682689697?ref=cm_sw_r_ffobk_cp_ud_dp_4NNGSGNAXYRH4R6011AK&ref_=cm_sw_r_ffobk_cp_ud_dp_4NNGSGNAXYRH4R6011AK&social_share=cm_sw_r_ffobk_cp_ud_dp_4NNGSGNAXYRH4R6011AK&bestFormat=true&previewDoh=1", "🇯🇵"],
] as const;

const socials = [
  ["Instagram", "https://www.instagram.com/nicholas.hamilton/", "instagram"],
  ["TikTok", "https://www.tiktok.com/@nic.hamilton?lang=en", "tiktok"],
  ["X", "https://x.com/Nic_Hamilton", "x"],
  ["Spotify", "https://open.spotify.com/artist/3HMSWfOFrYEocd591VAemA", "spotify"],
  ["YouTube", "https://www.youtube.com/channel/UCzEqBJgfWpYeQdnr-wGS26g", "youtube"],
] as const;

export default function Home() {
  const [shopOpen, setShopOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (contactOpen && !dialog.open) dialog.showModal();
    if (!contactOpen && dialog.open) dialog.close();
  }, [contactOpen]);

  async function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setContactStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });

      if (!response.ok) throw new Error("Message delivery failed");
      form.reset();
      setContactStatus("sent");
    } catch {
      setContactStatus("error");
    }
  }

  return (
    <main>
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Nicholas Hamilton, home"><img src="/nicholas-logo.png" alt="" /></a>
        <nav aria-label="Social links">
          {socials.map(([label, url, icon]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label}>
              <img src={`https://cdn.simpleicons.org/${icon}/111111`} alt="" width="20" height="20" />
            </a>
          ))}
        </nav>
      </header>
      <section className="hero" id="top">
        <p className="eyebrow">Actor · Musician · Author · Cocktail Person</p>
        <img className="hero-portrait" src="/nic-portrait.jpg" alt="Nicholas Hamilton holding a cocktail" />
        <h1>Nicholas<br />Hamilton<span className="period">.</span></h1>
        <p className="intro">
          <span>In things and on things.</span>
          <span>Respectful in this house.</span>
          <span>etcetera.</span>
        </p>
      </section>
      <section className="links" aria-label="Featured links">
        <div className={`feature-card ${shopOpen ? "is-open" : ""}`}>
          <button className="feature-toggle" type="button" onClick={() => setShopOpen(!shopOpen)} aria-expanded={shopOpen} aria-controls="retailers">
            <span className="number">01</span>
            <span className="feature-copy"><small>I wrote a book!</small><strong>SIPSY<span className="title-hyphen">-</span>DOOZY</strong><em>100+ Respectfully Crafted Cocktails for the Home Bartender</em></span>
            <span className="toggle-mark" aria-hidden="true">{shopOpen ? "−" : "+"}</span>
          </button>
          <div className="retailers" id="retailers" hidden={!shopOpen}>
            <p>Pick your country</p>
            <div className="country-grid">
              {retailers.map(([country, url, flag], index) => <a href={url} target="_blank" rel="noreferrer" key={country}><span>{String(index + 1).padStart(2, "0")}</span>{country}<b className="country-flag" aria-hidden="true">{flag}</b></a>)}
            </div>
          </div>
        </div>
        <button className="link-row contact-row" type="button" onClick={() => setContactOpen(true)}><span className="number">02</span><span>Want To Work Together?</span><b>Let’s talk ↗</b></button>
        <a className="link-row" href="https://quietneighbor.help/collections/vendors?q=Nicholas%20Hamilton" target="_blank" rel="noreferrer"><span className="number">03</span><span>Merch</span><b>Shop ↗</b></a>
        <a className="link-row cameo-row" href="https://www.cameo.com/nicholas.hamilton?utm_campaign=profile_share&amp;utm_content=c9f92c31-4b64-4ea0-bae6-dc9ea9eae0e9&amp;utm_medium=talent_unknown&amp;utm_source=talent_native_share&amp;%24web_only=true&amp;_branch_match_id=1624934674092330756&amp;_branch_referrer=H4sIAAAAAAAAA8soKSkottLXL9NLTsxNzddLzs%2FVT9XPTA43TzUrDMswT7KvK0pNSy0qysxLj08qyi8vTi2ydc4oys9NBQBg9ZgrOwAAAA%3D%3D" target="_blank" rel="noreferrer"><span className="number">04</span><span className="cameo-copy"><span>Cameo</span><b>LET’S CHAT ↗</b></span><img className="cameo-logo" src="/cameo-logo.png" alt="Cameo" /></a>
        <a className="link-row" href="https://a.co/d/08UU399t" target="_blank" rel="noreferrer"><span className="number">05</span><span>Amazon Storefront</span><b>Browse ↗</b></a>
      </section>
      <footer><span>© {new Date().getFullYear()} Nicholas Hamilton</span><span>Made with spirit</span></footer>
      <dialog ref={dialogRef} onClose={() => setContactOpen(false)} className="contact-sheet">
        <button className="close" type="button" onClick={() => setContactOpen(false)} aria-label="Close contact form">×</button>
        <p className="eyebrow">Contact</p><h2>Let’s make<br />something good.</h2>
        {contactStatus === "sent" ? (
          <div className="contact-success" role="status">
            <strong>Message sent.</strong>
            <p>Thanks for reaching out. A receipt is on its way to your inbox.</p>
            <button type="button" onClick={() => { setContactStatus("idle"); setContactOpen(false); }}>Done</button>
          </div>
        ) : <form onSubmit={sendEmail}>
          <label>Name<input name="name" autoComplete="name" required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Message<textarea name="message" rows={4} required /></label>
          {contactStatus === "error" && <p className="contact-error" role="alert">That didn’t send. Please try again.</p>}
          <button type="submit" disabled={contactStatus === "sending"}>{contactStatus === "sending" ? "Sending…" : "Send message"}</button>
        </form>}
      </dialog>
    </main>
  );
}
