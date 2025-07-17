import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const initialForm = {
  id: null,
  name: "",
  category: "foods",
  price: "",
  description: "",
  image: "",
};

const AdminList = () => {
  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get("http://localhost:3000/admin/catalogs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // hanya tampilkan yang belum dihapus
      const filtered = (res.data || []).filter((menu) => !menu.is_deleted);
      setMenus(filtered);
    } catch (err) {
      console.error("Gagal fetch menu:", err);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleEdit = (menu) => {
    setForm({
      id: menu.id,
      name: menu.name,
      price: menu.price,
      category: menu.category,
      description: menu.description,
      image: `http://localhost:3000/uploads/${menu.image}`,
    });
    setImageFile(null);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setForm(initialForm);
    setIsEditMode(false);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("is_deleted", false);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditMode && form.id) {
        await axios.put(`http://localhost:3000/admin/catalogs/${form.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Swal.fire("Berhasil!", "Menu berhasil diperbarui.", "success");
      } else {
        await axios.post("http://localhost:3000/admin/catalogs", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Swal.fire("Berhasil!", "Menu berhasil ditambahkan.", "success");
      }

      fetchMenus();
      handleCancelEdit();
    } catch (err) {
      console.error("Gagal simpan menu:", err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Menu akan dihapus (soft delete)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      await axios.delete(`http://localhost:3000/admin/catalogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Dihapus!", "Menu berhasil dihapus.", "success");
      fetchMenus();
    } catch (err) {
      console.error("Gagal hapus menu:", err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menghapus.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* LEFT SIDE: List Menu */}
      <div className="w-[70%] p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">List Menu</h2>

        <div className="mb-4 flex gap-3">
          {["all", "foods", "beverages", "dessert"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {cat === "all" ? "All Menu" : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {menus
            .filter((menu) =>
              selectedCategory === "all" ? true : menu.category === selectedCategory
            )
            .map((menu) => (
              <div
                key={menu.id}
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition relative"
              >
                <img
                  src={`http://localhost:3000/uploads/${menu.image}`}
                  alt={menu.name}
                  className="w-full h-36 object-cover rounded-md"
                />
                <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {menu.category}
                </span>
                <h3 className="mt-2 font-semibold text-lg">{menu.name}</h3>
                <p className="text-sm text-gray-500">{menu.description}</p>
                <p className="mt-2 font-bold text-blue-600">
                  Rp {parseInt(menu.price).toLocaleString()}
                </p>

                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => handleEdit(menu)}
                    className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-[30%] p-6 bg-white border-l border-gray-200 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          {isEditMode ? "Edit Menu" : "Add Menu"}
        </h2>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Preview Image */}
          <div className="mb-2 w-full h-[120px] bg-gray-100 rounded overflow-hidden flex items-center justify-center border border-dashed border-gray-300">
            {imageFile || form.image ? (
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : form.image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">Preview Image</span>
            )}
          </div>

          {/* File input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />

          <input
            type="text"
            name="name"
            placeholder="Nama Menu"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="foods">Foods</option>
            <option value="beverages">Beverages</option>
            <option value="dessert">Dessert</option>
          </select>

          <input
            type="number"
            name="price"
            placeholder="Harga"
            value={form.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <textarea
            name="description"
            placeholder="Deskripsi"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {isEditMode ? "Save Changes" : "Add Menu"}
            </button>

            {isEditMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminList;
