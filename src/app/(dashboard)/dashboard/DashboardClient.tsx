"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Building2, 
  X
} from "lucide-react";
import { toast } from "sonner";

interface Dept {
  id: string;
  name: string;
  college_id: string;
}

interface Subj {
  id: string;
  name: string;
  course_code: string;
  year_or_semester: number;
  department_id: string;
  department_name?: string;
}

export default function DashboardClient({
  initialDepartments,
  initialSubjects,
  user,
}: {
  initialDepartments: any[];
  initialSubjects: any[];
  user: any;
}) {
  const [departments, setDepartments] = useState<Dept[]>(initialDepartments);
  const [subjects, setSubjects] = useState<Subj[]>(initialSubjects);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

  // Add department modal/form states
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [addingDept, setAddingDept] = useState(false);

  // Add subject modal/form states
  const [showAddSubj, setShowAddSubj] = useState(false);
  const [newSubjName, setNewSubjName] = useState("");
  const [newSubjCode, setNewSubjCode] = useState("");
  const [newSubjSem, setNewSubjSem] = useState("1");
  const [newSubjDeptId, setNewSubjDeptId] = useState("");
  const [addingSubj, setAddingSubj] = useState(false);

  const toggleDept = (deptId: string) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setAddingDept(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeptName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create department");

      setDepartments((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewDeptName("");
      setShowAddDept(false);
      toast.success("Department created successfully.");
    } catch (err: any) {
      toast.error(err.message || "Error creating department.");
    } finally {
      setAddingDept(false);
    }
  };

  const handleAddSubj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim() || !newSubjCode.trim() || !newSubjDeptId || !newSubjSem) {
      toast.error("Please fill all fields.");
      return;
    }

    setAddingSubj(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubjName.trim(),
          courseCode: newSubjCode.trim(),
          yearOrSemester: parseInt(newSubjSem, 10),
          departmentId: newSubjDeptId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subject");

      setSubjects((prev) => [...prev, data].sort((a, b) => a.year_or_semester - b.year_or_semester || a.name.localeCompare(b.name)));
      setNewSubjName("");
      setNewSubjCode("");
      setShowAddSubj(false);
      toast.success("Subject registered successfully.");
    } catch (err: any) {
      toast.error(err.message || "Error creating subject.");
    } finally {
      setAddingSubj(false);
    }
  };

  // Filtered subjects for search input
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.course_code.toLowerCase().includes(q)
    );
  }, [searchQuery, subjects]);

  // Group subjects by department
  const subjectsByDept = useMemo(() => {
    const map: Record<string, Subj[]> = {};
    subjects.forEach((s) => {
      if (!map[s.department_id]) map[s.department_id] = [];
      map[s.department_id].push(s);
    });
    return map;
  }, [subjects]);

  return (
    <div className="space-y-6">
      {/* Dynamic Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search subjects by name or course code (e.g. CS101)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-12 text-sm rounded-xl glass-form-control shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 text-text-tertiary hover:text-text-secondary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchQuery && (
          <div className="absolute left-0 right-0 top-full mt-2 z-20 max-h-60 overflow-y-auto rounded-xl glass-modal p-2">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((s) => (
                <Link
                  key={s.id}
                  href={`/course/${s.course_code.toUpperCase()}/notes`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold glass-badge px-2.5 py-1 rounded">
                      {s.course_code.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary uppercase tracking-wider font-semibold">
                    Sem {s.year_or_semester}
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-text-tertiary">
                No matching subjects found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAddDept(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <Building2 className="h-3.5 w-3.5" />
          Add Department
        </button>

        <button
          onClick={() => {
            if (departments.length === 0) {
              toast.error("Create a department first before adding subjects.");
              return;
            }
            setShowAddSubj(true);
          }}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Subject
        </button>
      </div>

      {/* Inline Forms / Modals for adding Dept/Subject */}
      {showAddDept && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="font-bold text-sm">Add College Department</h3>
            <button onClick={() => setShowAddDept(false)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleAddDept} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. CSE, ECE, MECH"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              required
              className="flex-1 h-10 px-4 rounded-lg glass-form-control text-sm"
            />
            <button
              type="submit"
              disabled={addingDept}
              className="px-6 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all"
            >
              {addingDept ? "Creating..." : "Create"}
            </button>
          </form>
        </div>
      )}

      {showAddSubj && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="font-bold text-sm">Register New Subject</h3>
            <button onClick={() => setShowAddSubj(false)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleAddSubj} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Networks"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  required
                  className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS204"
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value)}
                  required
                  className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Semester / Year</label>
                <select
                  value={newSubjSem}
                  onChange={(e) => setNewSubjSem(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg glass-form-control text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Department</label>
                <select
                  value={newSubjDeptId}
                  onChange={(e) => setNewSubjDeptId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg glass-form-control text-sm"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={addingSubj}
              className="w-full h-10 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all"
            >
              {addingSubj ? "Registering..." : "Register Subject"}
            </button>
          </form>
        </div>
      )}

      {/* Course Tree Browser */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
          Academic Department Hierarchy
        </h3>

        {departments.length === 0 ? (
          <div className="glass-empty p-8 text-center text-sm text-text-tertiary">
            No departments created yet for this college. Click &quot;Add Department&quot; to start.
          </div>
        ) : (
          <div className="space-y-3">
            {departments.map((dept) => {
              const deptSubjects = subjectsByDept[dept.id] || [];
              const isOpen = !!expandedDepts[dept.id];
              
              // Group department subjects by semester
              const bySem: Record<number, Subj[]> = {};
              deptSubjects.forEach((s) => {
                if (!bySem[s.year_or_semester]) bySem[s.year_or_semester] = [];
                bySem[s.year_or_semester].push(s);
              });

              return (
                <div 
                  key={dept.id} 
                  className="glass-card overflow-hidden"
                >
                  {/* Department Row Header */}
                  <button
                    onClick={() => toggleDept(dept.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-accent-primary" />
                      </div>
                      <span className="font-bold text-sm">{dept.name} Department</span>
                      <span className="text-xs text-text-tertiary bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                        {deptSubjects.length} subjects
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-text-tertiary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-text-tertiary" />
                    )}
                  </button>

                  {/* Expanded Subjects List */}
                  {isOpen && (
                    <div className="border-t border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                      {deptSubjects.length === 0 ? (
                        <p className="text-xs text-text-tertiary italic">
                          No subjects registered in this department yet.
                        </p>
                      ) : (
                        Object.entries(bySem)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([sem, subs]) => (
                            <div key={sem} className="space-y-2">
                              <h4 className="text-[10px] uppercase font-bold tracking-wider text-text-tertiary">
                                Semester {sem}
                              </h4>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {subs.map((s) => (
                                  <Link
                                    key={s.id}
                                    href={`/course/${s.course_code.toUpperCase()}/notes`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-accent-primary/20 transition-all duration-200"
                                  >
                                    <span className="text-[10px] font-mono font-bold glass-badge px-2 py-0.5 rounded shrink-0">
                                      {s.course_code.toUpperCase()}
                                    </span>
                                    <span className="text-xs font-semibold text-text-secondary hover:text-text-primary truncate">
                                      {s.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
