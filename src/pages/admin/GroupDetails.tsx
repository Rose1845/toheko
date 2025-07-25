import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { groupService } from "../../services/groupService";
import { Dialog } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";

export default function GroupDetails() {
  const { groupId } = useParams();
  const [activeTab, setActiveTab] = useState("info");
  const [group, setGroup] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOfficial, setNewOfficial] = useState({ name: "", position: "" });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const id = Number(groupId);
      const groupData = await groupService.getGroupById(id);
      setGroup(groupData);
      const officialsData = await groupService.getGroupOfficials(id);
      setOfficials(officialsData.content || []);
      setLoading(false);
    }
    fetchData();
  }, [groupId]);

  if (loading) return <div>Loading...</div>;

  async function handleAddOfficial(e) {
    e.preventDefault();
    try {
      const id = Number(groupId);
      await groupService.createGroupOfficial({
        groupId: id,
        name: newOfficial.name,
        position: newOfficial.position,
      });
      toast({ title: "Official added" });
      setShowAddModal(false);
      setNewOfficial({ name: "", position: "" });
      // Refresh officials list
      const officialsData = await groupService.getGroupOfficials(id);
      setOfficials(officialsData.content || []);
    } catch (err) {
      toast({ title: "Error adding official", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Group Details</h2>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === "info" ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setActiveTab("info")}
        >
          Info
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "officials" ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setActiveTab("officials")}
        >
          Officials
        </button>
      </div>
      {activeTab === "info" && (
        <div>
          <p><strong>Name:</strong> {group?.groupName}</p>
          <p><strong>Type:</strong> {group?.groupType}</p>
          <p><strong>Registration #:</strong> {group?.registrationNumber}</p>
          <p><strong>Email:</strong> {group?.email}</p>
          <p><strong>Phone:</strong> {group?.phoneNumber}</p>
          <p><strong>Address:</strong> {group?.physicalAddress}</p>
        </div>
      )}
      {activeTab === "officials" && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Group Officials</h3>
          <ul className="mb-4">
            {officials.map((official) => (
              <li key={official.id} className="border-b py-2">
                <span className="font-medium">{official.name}</span> - {official.position}
              </li>
            ))}
          </ul>
          <button className="bg-primary text-white px-4 py-2 rounded" onClick={() => setShowAddModal(true)}>
            Add Official
          </button>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <form className="p-4" onSubmit={handleAddOfficial}>
              <h4 className="text-lg font-semibold mb-2">Add Group Official</h4>
              <div className="mb-2">
                <label className="block mb-1">Name</label>
                <Input
                  value={newOfficial.name}
                  onChange={e => setNewOfficial({ ...newOfficial, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">Position</label>
                <Input
                  value={newOfficial.position}
                  onChange={e => setNewOfficial({ ...newOfficial, position: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Add</button>
                <button type="button" className="bg-muted px-4 py-2 rounded" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </Dialog>
        </div>
      )}
    </div>
  );
}
