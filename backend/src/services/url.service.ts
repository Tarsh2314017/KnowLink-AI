// export const validateUrl = (value: string): URL => {
//   let parsedUrl: URL;

//   try {
//     parsedUrl = new URL(value);
//   } catch {
//     throw new Error("Invalid URL");
//   }

//   if (!["http:", "https:"].includes(parsedUrl.protocol)) {
//     throw new Error("Only HTTP and HTTPS URLs are allowed");
//   }

//   if (parsedUrl.username || parsedUrl.password) {
//     throw new Error("URLs containing credentials are not allowed");
//   }

//   return parsedUrl;
// };

import dns from "node:dns/promises";
import net from "node:net";

const isPrivateIPv4 = (ip: string): boolean => {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
};

export const validateUrl = async (value: string): Promise<URL> => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("Invalid URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("URLs containing credentials are not allowed");
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    throw new Error("Access to local addresses is not allowed");
  }

  if (net.isIP(hostname) === 4 && isPrivateIPv4(hostname)) {
    throw new Error("Access to private IP addresses is not allowed");
  }

  if (!net.isIP(hostname)) {
    const addresses = await dns.lookup(hostname, {
      all: true,
    });

    for (const address of addresses) {
      if (
        address.family === 4 &&
        isPrivateIPv4(address.address)
      ) {
        throw new Error("URL resolves to a private IP address");
      }

      if (address.family === 6 && address.address === "::1") {
        throw new Error("URL resolves to a local address");
      }
    }
  }

  return parsedUrl;
};