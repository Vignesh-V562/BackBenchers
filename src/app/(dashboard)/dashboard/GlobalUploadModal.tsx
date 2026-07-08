"use client";

import { useState } from "react";
import { X, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function GlobalUploadModal({
  departments,
  onClose,
}: {
  departments: any[];
  onClose: () => void;
}) {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("NOTES");
  const [examCategory, setExamCategory] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [year, setYear] = useState("1");
  const [staffName, setStaffName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !type || !departmentName.trim() || !subjectName.trim() || !courseCode.trim() || !year) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a document file to upload.");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload file to server upload API
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "File upload failed.");
      }

      // 2. Submit document metadata
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          examCategory: type === "QUESTION_PAPER" ? (examCategory || undefined) : undefined,
          departmentName: departmentName.trim(),
          subjectName: subjectName.trim(),
          courseCode: courseCode.trim().toUpperCase(),
          year: parseInt(year, 10),
          staffName: staffName.trim() || undefined,
          fileUrl: uploadData.secure_url,
          fileType: uploadData.file_type,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload metadata failed.");

      toast.success("Document uploaded successfully.");
      onClose();
      router.refresh(); // Refresh page to see new subjects/departments
    } catch (err: any) {
      toast.error(err.message || "Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-overlay overflow-y-auto">
      <div className="w-full max-w-xl glass-modal p-6 my-8 space-y-4 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 sticky top-0 bg-brand-surface/80 backdrop-blur-md z-10 -mx-6 px-6 -mt-6 pt-6">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-accent-primary" />
            <h3 className="font-bold text-base">Upload Study Material</h3>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Material Name / Title *</label>
              <input
                type="text"
                placeholder="e.g. Unit 3 - Operating Systems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Document Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg glass-form-control text-sm"
              >
                <option value="NOTES">Notes</option>
                <option value="QUESTION_PAPER">Question Paper</option>
                <option value="OTHER_MATERIAL">Other Material</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-secondary">Description (Optional)</label>
            <textarea
              placeholder="Brief summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-16 p-3 rounded-lg glass-form-control text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Department *</label>
              <input
                list="departments-list"
                type="text"
                placeholder="Search or type department..."
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
              />
              <datalist id="departments-list">
                {departments.map((d) => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Subject Name *</label>
              <input
                type="text"
                placeholder="e.g. Data Structures"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Course Code *</label>
              <input
                type="text"
                placeholder="e.g. CS101"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Semester / Year *</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-10 px-3 rounded-lg glass-form-control text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary">Staff / Professor Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Dr. Alan Turing"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
              />
            </div>
            
            {type === "QUESTION_PAPER" && (
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Exam Category *</label>
                <select
                  value={examCategory}
                  onChange={(e) => setExamCategory(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg glass-form-control text-sm"
                >
                  <option value="">Select Category...</option>
                  <option value="CIA1">CIA 1 / Midterm 1</option>
                  <option value="CIA2">CIA 2 / Midterm 2</option>
                  <option value="MIDSEM">Mid Semester</option>
                  <option value="ENDSEM">End Semester</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-text-secondary font-semibold">Select Document File (PDF, DOCX, JPG, PNG) *</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
              className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/[0.05] file:text-text-primary hover:file:bg-white/[0.08] file:cursor-pointer bg-white/[0.02] border border-white/[0.06] rounded-lg p-2 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.06] mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="h-10 px-4 rounded-lg border border-white/[0.06] bg-white/[0.03] text-sm font-bold hover:bg-white/[0.06] disabled:opacity-50 transition-all text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="h-10 px-6 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all"
            >
              {uploading ? "Uploading..." : "Upload Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
