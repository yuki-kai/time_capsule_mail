import React, { useEffect } from 'react';

declare global {
	interface Window {
		adsbygoogle?: Array<unknown>;
	}
}

const HOSTNAME = "www.time-capsule-mail.yuki-fourseasons.com";
const ADS_CLIENT = "ca-pub-9732055066853727";
const ADS_SLOT = "8348186233";

const GoogleAdsense: React.FC = () => {
  const isProdHost = typeof window !== 'undefined' && window.location.hostname === HOSTNAME;

  useEffect(() => {
    if (!isProdHost) return;
    const scriptId = 'adsbygoogle-js';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}`;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {}
  }, [isProdHost]);

	return (
    <div>
      {isProdHost ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center', minHeight: 250, width: '100%', margin: '0 auto' }}
          data-ad-format="auto"
          data-ad-client={ADS_CLIENT}
          data-ad-slot={ADS_SLOT}
          data-full-width-responsive="true"
        />
      ) : null}
    </div>
	);
};

export default GoogleAdsense;
