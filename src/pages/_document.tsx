import * as React from 'react';
// next
import Document, { Html, Head, Main, NextScript } from 'next/document';
// @emotion
import createEmotionServer from '@emotion/server/create-instance';
// utils
import createEmotionCache from '../utils/createEmotionCache';
// theme
import palette from '../theme/palette';
import { primaryFont } from '../theme/typography';

// ----------------------------------------------------------------------

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className={primaryFont.className}>
        <Head>
          <meta charSet="utf-8" />
          <link rel="manifest" href="/manifest.json" />

          {/* PWA primary color */}
          <meta name="theme-color" content={palette('light').primary.main} />

          {/* Favicon */}
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />

          {/* Emotion */}
          <meta name="emotion-insertion-point" content="" />
          {(this.props as any).emotionStyleTags}

          {/* Meta */}
          <meta
            name="description"
            content="BIMNEXT begins unity where physical and digital information integrated to project management."
          />
          <meta name="keywords" content="BIM, CDE, digital twins, project manager" />
          <meta name="author" content="DP Unity" />

          {/* Autodesk Forge Viewer files */}
          <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.93.1/style.min.css" type="text/css" />
          <script src='https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.min.js?v=v7.93.1'></script>

          {/* Potree extensions */}
          {/* <script src="/extensions/PotreeExtension/contents/potree.js"></script>
          <script src="/extensions/PotreeExtension/contents/PotreeExtension.js"></script> */}

          {/* Mapbox GL */}
          {/* <link href="https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css" rel="stylesheet" />
          <script src="https://unpkg.com/@turf/turf@6/turf.min.js"></script>
          <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.js"></script>
          <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css" type="text/css"></link> */}

        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// ----------------------------------------------------------------------

MyDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;

  const cache = createEmotionCache();

  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);

  const emotionStyles = extractCriticalToChunks(initialProps.html);

  const emotionStyleTags = emotionStyles.styles.map((style: any) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
  };
};
