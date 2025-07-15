import { useEffect, useState } from "react";
import axios from "axios";

const SettingPage = () => {
  const stored = JSON.parse(localStorage.getItem("user"));
  const token = stored?.token;
  const [user, setUser] = useState(stored?.user || {});
  const [formData, setFormData] = useState({
    username: user?.username || "",
    language: user?.language || "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [preview, setPreview] = useState("/default-avatar.png");

  // Update preview setiap kali user berubah
  useEffect(() => {
    if (user?.avatar) {
      setPreview(`http://localhost:3000/${user.avatar}`);
    } else {
      setPreview("/default-avatar.png");
    }
  }, [user]);

  // Optional: fetch profile ulang (kalau user kosong atau avatar null)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3000/cashier/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify({ token, user: res.data }));
      } catch (err) {
        console.error("Gagal fetch profil:", err);
      }
    };

    if (!user?.avatar) {
      fetchProfile();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put("http://localhost:3000/cashier/settings", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify({ token, user: updatedUser }));
      setUser(updatedUser);

      alert("Profil berhasil diperbarui!");
    } catch (err) {
      alert("Gagal memperbarui profil.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.put(
        "http://localhost:3000/cashier/settings/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password berhasil diganti. Silakan login ulang.");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err) {
      alert("Gagal mengganti password: " + err.response?.data?.message);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      const uploadData = new FormData();
      uploadData.append("avatar", file);
      try {
        const res = await axios.patch("http://localhost:3000/cashier/settings/avatar", uploadData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const updatedUser = { ...user, avatar: res.data.avatar };
        localStorage.setItem("user", JSON.stringify({ token, user: updatedUser }));
        setUser(updatedUser);

        alert("Upload berhasil");
      } catch (err) {
        alert("Gagal upload avatar");
      }
    }
  };

  const handleDeletePicture = async () => {
    try {
      await axios.patch(
        "http://localhost:3000/cashier/settings/avatar/delete",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPreview("/default-avatar.png");
      const updatedUser = { ...user, avatar: null };
      localStorage.setItem("user", JSON.stringify({ token, user: updatedUser }));
      setUser(updatedUser);
      alert("Foto berhasil dihapus!");
    } catch (err) {
      alert("Gagal menghapus foto.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="flex items-start gap-6 mb-8">
        <div className="flex flex-col items-center gap-2">
          <img src={preview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border" />
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button
            onClick={handleDeletePicture}
            className="text-sm text-red-500 hover:underline mt-1"
          >
            Delete Picture
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 text-sm">
          <div>
            <label className="block font-medium">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block font-medium">Role</label>
            <input
              value={user.role}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Status</label>
            <input
              value={user.status || "Active"}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Language</label>
            <select
              name="language"
              value={formData.language || "Indonesia"}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="Indonesia">Indonesia</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveProfile}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-10"
      >
        Simpan Perubahan
      </button>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Ganti Password</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm">Password Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
        <button
          onClick={handlePasswordChange}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ganti Password
        </button>
      </div>
    </div>
  );
};

export default SettingPage;
