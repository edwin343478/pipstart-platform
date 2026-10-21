import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({admin:vi.fn(),rpc:vi.fn()}));
vi.mock("../supabase/admin",()=>({createSupabaseAdminClient:mocks.admin}));
import { createAddressSuppressionStore } from "./address-suppression-store";
const event={eventId:"msg_generated",messageId:"generated-provider",address:"a@example.test",reason:"complaint" as const,occurredAt:"2026-10-21T10:00:00.000Z"};
beforeEach(()=>{vi.resetAllMocks();mocks.admin.mockReturnValue({rpc:mocks.rpc});});
describe("private address block persistence adapter",()=>{
 it("has no store without service configuration",()=>{mocks.admin.mockReturnValue(null);expect(createAddressSuppressionStore()).toBeNull();});
 it.each(["recorded","duplicate"])("maps atomic %s",async data=>{mocks.rpc.mockResolvedValue({data,error:null});expect(await createAddressSuppressionStore()!.record(event)).toBe(data);expect(mocks.rpc).toHaveBeenCalledWith("pipstart_record_optional_address_block",{p_event_id:event.eventId,p_message_id:event.messageId,p_email:event.address,p_reason:event.reason,p_occurred_at:event.occurredAt});});
 it.each([null,{},true,"bad"])("rejects malformed acknowledgement %j",async data=>{mocks.rpc.mockResolvedValue({data,error:null});await expect(createAddressSuppressionStore()!.record(event)).rejects.toThrow(/^Address suppression persistence unavailable$/);});
 it("does not echo database errors",async()=>{mocks.rpc.mockResolvedValue({error:{message:"private"}});await expect(createAddressSuppressionStore()!.record(event)).rejects.toThrow(/^Address suppression persistence unavailable$/);});
});
