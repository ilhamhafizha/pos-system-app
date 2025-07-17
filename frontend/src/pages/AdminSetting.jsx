import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AdminSetting = () => {
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

  useEffect(() => {
    if (user?.avatar) {
      setPreview(`http://localhost:3000/${user.avatar}`);
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3000/admin/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify({ token, user: res.data }));
      } catch (err) {
        console.error("Gagal fetch profil:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put("http://localhost:3000/admin/settings", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify({ token, user: updatedUser }));
      setUser(updatedUser);
      Swal.fire("Berhasil", "Profil berhasil diperbarui!", "success");
    } catch (err) {
      Swal.fire("Gagal", "Gagal memperbarui profil.", "error");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.put(
        "http://localhost:3000/admin/settings/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Berhasil", "Password berhasil diganti. Silakan login ulang.", "success");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal mengganti password", "error");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      const uploadData = new FormData();
      uploadData.append("avatar", file);
      try {
        const res = await axios.patch("http://localhost:3000/admin/settings/avatar", uploadData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const updatedUser = { ...user, avatar: res.data.avatar };
        localStorage.setItem("user", JSON.stringify({ token, user: updatedUser }));
        setUser(updatedUser);
        Swal.fire("Berhasil", "Foto profil berhasil diupload", "success");
      } catch (err) {
        Swal.fire("Gagal", "Gagal upload avatar", "error");
      }
    }
  };

  const handleDeletePicture = async () => {
    const result = await Swal.fire({
      title: "Hapus Foto Profil?",
      text: "Apakah kamu yakin ingin menghapus foto profil?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(
          "http://localhost:3000/admin/settings/avatar/delete",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPreview("/default-avatar.png");
        const updatedUser = { ...user, avatar: null };
        localStorage.setItem("user", JSON.stringify({ token, user: updatedUser }));
        setUser(updatedUser);
        Swal.fire("Berhasil", "Foto berhasil dihapus!", "success");
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus foto.", "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Pengaturan Profil</h2>
        <button
          type="button"
          onClick={handleSaveProfile}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Simpan Perubahan
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3 w-full md:w-1/4">
          <img src={preview} alt="Avatar" className="w-28 h-28 rounded-full object-cover border" />
          <label
            htmlFor="fileInput"
            className="bg-gray-100 px-3 py-1 rounded cursor-pointer hover:bg-gray-200 text-sm"
          >
            Choose File
          </label>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleDeletePicture}
            className="text-sm text-red-500 hover:underline"
          >
            Delete Picture
          </button>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 text-sm">
          <div>
            <label className="block font-medium text-gray-600">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600">Role</label>
            <input
              value={user.role}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600">Status</label>
            <input
              value={user.status || "Active"}
              disabled
              className="w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Ganti Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600">Password Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handlePasswordChange}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Ganti Password
        </button>
      </div>
    </div>
  );
};

export default AdminSetting;
