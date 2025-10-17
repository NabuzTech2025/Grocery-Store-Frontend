import React from "react";
import { Helmet } from "react-helmet";
import { currentMeta } from "../utils/metaTagsContent";

const MetaTags = () => {
  console.log("currentMeta", currentMeta);
  return (
    <Helmet>
      <html lang={currentMeta.language} />
      <meta name="title" content={currentMeta.title} />
      <meta name="description" content={currentMeta.description} />
      <meta name="keywords" content={currentMeta.keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={currentMeta.language} />
    </Helmet>
  );
};

export default MetaTags;
