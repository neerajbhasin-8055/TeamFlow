
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8081/api/users/me";

function Profile() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        role: "",
        createdAt: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Unable to load profile.");
                }

                const data = await response.json();

                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    role: data.role || "",
                    createdAt: data.createdAt || "",
                });
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data.message || "Unable to update profile."
                );
            }

            const updatedProfile = await response.json();

            setProfile((previous) => ({
                ...previous,
                name: updatedProfile.name,
                email: updatedProfile.email,
                role: updatedProfile.role,
                createdAt: updatedProfile.createdAt,
            }));

            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
                Loading profile...
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-3xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                    Personal information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    View and update your account details.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
            >
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Full name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={profile.name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Email address
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={profile.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="role"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Account role
                    </label>

                    <input
                        id="role"
                        name="role"
                        value={profile.role}
                        readOnly
                        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                        Your account role cannot be changed here.
                    </p>
                </div>

                {profile.createdAt && (
                    <div>
                        <p className="mb-1 text-sm font-medium text-slate-700">
                            Member since
                        </p>
                        <p className="text-sm text-slate-500">
                            {new Date(profile.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }
                            )}
                        </p>
                    </div>
                )}

                {error && (
                    <p role="alert" className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <p role="status" className="text-sm text-green-600">
                        {success}
                    </p>
                )}

                <div className="flex justify-end border-t border-slate-100 pt-5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default Profile;
