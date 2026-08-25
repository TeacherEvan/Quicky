"use client";

import { useState } from "react";

const SCHEME = "boltd://";
const TARGET = "home";

export default function BoltPage() {
  const [attempted, setAttempted] = useState(false);

  function launch() {
    setAttempted(true);
    const url = `${SCHEME}${TARGET}`;
    const t = Date.now();
    const onBlur = () => {
      if (Date.now() - t < 1500) {
        // Browser may have opened the app; nothing to do.
      }
      window.removeEventListener("blur", onBlur);
    };
    window.addEventListener("blur", onBlur);
    window.location.href = url;
  }

  return (
    <article>
      <h2>Bolt</h2>
      <p className="muted">
        Opens the Bolt app via the <code>boltd://</code> URL scheme. Only
        works on a device where Bolt is installed; on desktop or where the
        scheme is unregistered, nothing happens.
      </p>
      <p>
        <button className="button" onClick={launch} type="button">
          Open Bolt
        </button>
      </p>
      {attempted ? (
        <p className="muted">
          If Bolt is installed on this device, the app should now be opening.
          If nothing happened, Bolt is not installed — install it from your
          app store and try again.
        </p>
      ) : null}
    </article>
  );
}
