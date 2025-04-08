import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req, ctx) {
    const url = new URL(req.url);
    return Response.redirect(`${url.origin}/login`, 307);
  },
};

export default function Home() {
  return null;
}
