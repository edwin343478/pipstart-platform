import {beforeEach,describe,expect,it,vi} from "vitest";
const mocks=vi.hoisted(()=>({admin:vi.fn(),rpc:vi.fn()}));vi.mock("../supabase/admin",()=>({createSupabaseAdminClient:mocks.admin}));
import {createOptionalProviderEvidenceStore} from "./delivery-evidence-store";
beforeEach(()=>{vi.resetAllMocks();mocks.admin.mockReturnValue({rpc:mocks.rpc});});
describe("optional provider evidence service store",()=>{
 it("is absent without server configuration",()=>{mocks.admin.mockReturnValue(null);expect(createOptionalProviderEvidenceStore()).toBeNull();});
 it.each(["bound","duplicate"])("records %s API receipt through only the private RPC",async data=>{mocks.rpc.mockResolvedValue({data,error:null});await createOptionalProviderEvidenceStore()!.acknowledge("job","provider","hash");expect(mocks.rpc).toHaveBeenCalledWith("pipstart_record_optional_provider_ack",{p_job_id:"job",p_provider_id:"provider",p_digest:"hash"});});
 it.each(["recorded","duplicate","ignored"] as const)("records %s callback",async data=>{mocks.rpc.mockResolvedValue({data,error:null});expect(await createOptionalProviderEvidenceStore()!.record({jobId:"job",providerId:"provider",preparedHash:"hash",eventId:"event",recipient:"generated@example.test",type:"email.sent",occurredAt:"2026-01-01T00:00:00Z"})).toBe(data);});
 it.each([null,{},true,"ignored","bad"])("rejects malformed/ignored ack %j",async data=>{mocks.rpc.mockResolvedValue({data,error:null});await expect(createOptionalProviderEvidenceStore()!.acknowledge("job","provider","hash")).rejects.toThrow(/^Optional provider evidence unavailable$/);});
 it("does not expose RPC error details",async()=>{mocks.rpc.mockResolvedValue({error:{message:"private"}});await expect(createOptionalProviderEvidenceStore()!.acknowledge("job","provider","hash")).rejects.toThrow(/^Optional provider evidence unavailable$/);});
});
