import {afterEach,expect,it,vi} from "vitest";
const mocks=vi.hoisted(()=>({handle:vi.fn(),store:vi.fn()}));
vi.mock("@/lib/optional-email/delivery-evidence",()=>({handleOptionalDeliveryWebhook:mocks.handle}));
vi.mock("@/lib/optional-email/delivery-evidence-store",()=>({createOptionalProviderEvidenceStore:mocks.store}));
import {POST,runtime,maxDuration} from "./route";
afterEach(()=>{vi.unstubAllEnvs();vi.resetAllMocks();});
it("uses only the dedicated optional delivery secret and store, without send wiring",async()=>{vi.stubEnv("PIPSTART_OPTIONAL_DELIVERY_WEBHOOK_SECRET"," dedicated ");const store={record:vi.fn()},response=new Response("ok");mocks.store.mockReturnValue(store);mocks.handle.mockResolvedValue(response);const request=new Request("https://pipstart.net/api/webhooks/resend/optional-delivery",{method:"POST"});expect(await POST(request)).toBe(response);expect(mocks.handle).toHaveBeenCalledWith(request,"dedicated",store);expect(runtime).toBe("nodejs");expect(maxDuration).toBe(30);});
