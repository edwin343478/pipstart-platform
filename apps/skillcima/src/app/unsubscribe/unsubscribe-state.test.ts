import {
  describe,
  expect,
  it,
} from "vitest";

import {
  extractUnsubscribeToken,
  mapUnsubscribeApiResponse,
} from "./unsubscribe-state";

const token = "a".repeat(64);

describe(
  "Skillcima unsubscribe page state helpers",
  () => {
    it(
      "extracts exactly one valid opaque unsubscribe token",
      () => {
        expect(
          extractUnsubscribeToken(
            `?token=${token}`,
          ),
        ).toEqual({
          status: "ready",
          token,
        });
      },
    );

    it(
      "rejects malformed and duplicate tokens",
      () => {
        expect(
          extractUnsubscribeToken(
            "?token=not-a-token",
          ),
        ).toEqual({
          status: "invalid",
        });

        expect(
          extractUnsubscribeToken(
            `?token=${token}&token=${"b".repeat(64)}`,
          ),
        ).toEqual({
          status: "invalid",
        });
      },
    );

    it(
      "maps successful and replayed unsubscribe responses to success",
      () => {
        expect(
          mapUnsubscribeApiResponse(
            200,
            {
              ok: true,
              status: "unsubscribed",
            },
          ),
        ).toBe("success");

        expect(
          mapUnsubscribeApiResponse(
            200,
            {
              ok: true,
              status:
                "already_unsubscribed",
            },
          ),
        ).toBe("success");
      },
    );

    it(
      "maps invalid unsubscribe links",
      () => {
        expect(
          mapUnsubscribeApiResponse(
            400,
            {
              ok: false,
              error: {
                code:
                  "INVALID_UNSUBSCRIBE_LINK",
              },
            },
          ),
        ).toBe("invalid");
      },
    );

    it(
      "maps stale subscription-cycle links",
      () => {
        expect(
          mapUnsubscribeApiResponse(
            410,
            {
              ok: false,
              error: {
                code:
                  "UNSUBSCRIBE_LINK_STALE",
              },
            },
          ),
        ).toBe("stale");
      },
    );

    it(
      "maps temporary server failures as retryable",
      () => {
        expect(
          mapUnsubscribeApiResponse(
            503,
            {
              ok: false,
              error: {
                code:
                  "UNSUBSCRIBE_UNAVAILABLE",
              },
            },
          ),
        ).toBe("retryable");
      },
    );

    it(
      "fails closed on unexpected API responses",
      () => {
        expect(
          mapUnsubscribeApiResponse(
            409,
            {
              ok: false,
              error: {
                code:
                  "UNSUBSCRIBE_STATE_INVALID",
              },
            },
          ),
        ).toBe("failure");

        expect(
          mapUnsubscribeApiResponse(
            200,
            {
              ok: true,
              status: "unexpected",
            },
          ),
        ).toBe("failure");
      },
    );
  },
);
