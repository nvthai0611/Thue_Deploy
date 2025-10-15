"use client";

import React, { useEffect } from "react";

// Environment variables - Sửa TOKEN_ID
const BACKEND_URL = process.env.NEXT_PUBLIC_VNPT_BACKEND_URL || "";
const TOKEN_KEY = process.env.NEXT_PUBLIC_VNPT_TOKEN_KEY || "";
const TOKEN_ID = process.env.NEXT_PUBLIC_VNPT_TOKEN_ID || "";
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_VNPT_ACCESS_TOKEN || "";

// Callback function to handle result
function getResult(result: any) {
  console.log("eKYC Result:", result);
  if (result?.error) {
    console.error("VNPT API Error:", result.error);
    alert("An error occurred while processing data. Please try again.");
  } else if (result?.success) {
    console.log("Processing successful, moving to next step:", result);
  } else {
    console.log("Undefined result:", result);
  }
}

const EKYCSdk = () => {
  useEffect(() => {
    // Store original functions to restore later
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // Intercept fetch requests to add authorization header
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url =
        typeof input === "string"
          ? input
          : typeof input === "object" && "url" in input
            ? input.url
            : input.toString();

      if (url.includes("api.idg.vnpt.vn") || url.includes(BACKEND_URL)) {
        init = init || {};
        // Chỉ thêm header nếu chưa tồn tại
        const headers = new Headers(init.headers || {});

        headers.set("Authorization", `Bearer ${ACCESS_TOKEN}`);

        if (!headers.has("token-id")) {
          headers.set("token-id", TOKEN_ID);
        }
        if (!headers.has("token-key")) {
          headers.set("token-key", TOKEN_KEY);
        }
        if (!headers.has("mac-address")) {
          headers.set("mac-address", "WEB-001");
        }
        init.headers = headers;
        console.log("Adding authorization header to VNPT fetch request:", url);
      }

      return originalFetch.call(this, input, init);
    };

    // Intercept XMLHttpRequest
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      // Store the URL for later use in send method
      (this as any)._vnptUrl = url.toString();
      (this as any)._vnptHeadersSet = false; // Reset flag for each request

      const asyncValue = typeof async === "boolean" ? async : true;
      return originalXHROpen.call(
        this,
        method,
        url,
        asyncValue,
        username,
        password,
      );
    };

    XMLHttpRequest.prototype.send = function (
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
      const url = (this as any)._vnptUrl;

      // Check if this is a VNPT API request and haven't set headers yet
      if (
        url &&
        (url.includes("api.idg.vnpt.vn") || url.includes(BACKEND_URL)) &&
        !(this as any)._vnptHeadersSet
      ) {
        // Set headers only once per request
        this.setRequestHeader("authorization", `Bearer ${ACCESS_TOKEN}`);
        this.setRequestHeader("token-id", TOKEN_ID);
        this.setRequestHeader("token-key", TOKEN_KEY);
        this.setRequestHeader("mac-address", "WEB-001");

        // Mark that headers have been set for this request
        (this as any)._vnptHeadersSet = true;

        console.log("Adding authorization header to VNPT XHR request:", url);
        console.log("Using token-id:", TOKEN_ID);
      }

      return originalXHRSend.apply(this, [body]);
    };

    // Config object for SDK
    const dataConfig = {
      BACKEND_URL,
      TOKEN_KEY,
      TOKEN_ID,
      ACCESS_TOKEN,

      HAS_RESULT_SCREEN: true,
      FLOW_TAKEN: "DOCUMENT", // Chỉ OCR, không có face detection
      LIST_TYPE_DOCUMENT: [-1],
      DOCUMENT_TYPE_START: -1,
      CHECK_LIVENESS_CARD: true, // Tắt liveness cho thẻ
      CHECK_LIVENESS_FACE: true, // Tắt liveness cho face
      CHECK_MASKED_FACE: true, // Tắt kiểm tra khẩu trang
      COMPARE_FACE: true, // Tắt so sánh face
      CUSTOM_THEME: {},
      CHALLENGE_CODE: "9999999",
      SHOW_STEP: true,
      HAS_QR_SCAN: false,
      DEFAULT_LANGUAGE: "en",
      CALL_BACK: getResult,
      CONTAINER_ID: "ekyc_sdk_intergrated",
    };

    // Dynamically load the SDK script if not already loaded
    if (!document.getElementById("sdk-web-js")) {
      const script = document.createElement("script");
      script.id = "sdk-web-js";
      script.src = "/sdk-web.js";
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // @ts-ignore
        if (window.SDK) {
          console.log("SDK Config:", dataConfig);
          console.log("Authorization interceptors applied");
          // @ts-ignore
          window.SDK.launch(dataConfig);
        }
      };
    } else {
      // @ts-ignore
      if (window.SDK) {
        console.log("SDK Config:", dataConfig);
        console.log("Authorization interceptors applied");
        // @ts-ignore
        window.SDK.launch(dataConfig);
      }
    }

    // Cleanup function to restore original methods
    return () => {
      // Restore original functions
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;

      console.log("Authorization interceptors removed");
    };
  }, []);

  return (
    <div>
      <div id="ekyc_sdk_intergrated"></div>
    </div>
  );
};

export default EKYCSdk;
