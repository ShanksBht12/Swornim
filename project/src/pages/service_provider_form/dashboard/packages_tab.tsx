"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Plus, X, Package, CheckCircle, CreditCard, Clock, Star, Edit, Trash2 } from "lucide-react"
import { useAuth } from "../../../context/AuthContext"
// @ts-ignore
import { packageService } from "../../../services/packageService"

const PackagesTab = () => {
  const { user } = useAuth()
  const [packages, setPackages] = useState<any[]>([])
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [packagesError, setPackagesError] = useState("")

  // Add state for modal visibility and form data
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    durationHours: "",
    features: "",
    isActive: true,
  })
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  // Fetch packages for the logged-in provider
  useEffect(() => {
    if (!user) return
    setPackagesLoading(true)
    setPackagesError("")
    packageService
      .getPackages(user.id)
      .then(setPackages)
      .catch((err: any) => setPackagesError(err.message || "Failed to load packages"))
      .finally(() => setPackagesLoading(false))
  }, [user])

  // Logic for creating a package
  const handleCreatePackage = async (data: any) => {
    try {
      const newPkg = await packageService.createPackage(data)
      setPackages((pkgs) => [...pkgs, newPkg])
    } catch (err: any) {
      setPackagesError(err.message || "Failed to create package")
    }
  }

  // Logic for updating a package
  const handleUpdatePackage = async (id: string, updates: any) => {
    try {
      const updated = await packageService.updatePackage(id, updates)
      setPackages((pkgs) => pkgs.map((pkg) => (pkg.id === id ? updated : pkg)))
    } catch (err: any) {
      setPackagesError(err.message || "Failed to update package")
    }
  }

  // Logic for deleting a package
  const handleDeletePackage = async (id: string) => {
    try {
      await packageService.deletePackage(id)
      setPackages((pkgs) => pkgs.filter((pkg) => pkg.id !== id))
    } catch (err: any) {
      // Show a user-friendly error if backend returns a known message
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('Cannot delete package')) {
        setPackagesError(err.response.data.error)
      } else {
        setPackagesError(err.message || "Failed to delete package")
      }
    }
  }

  // Open modal for create or edit
  const openPackageModal = (pkg: any | null = null) => {
    setEditingPackage(pkg)
    setFormError("")
    if (pkg) {
      setFormData({
        name: String(pkg.name ?? ""),
        description: String(pkg.description ?? ""),
        basePrice: String(pkg.basePrice ?? ""),
        durationHours: String(pkg.durationHours ?? ""),
        features: Array.isArray(pkg.features) ? pkg.features.join(", ") : "",
        isActive: pkg.isActive ?? true,
      })
    } else {
      setFormData({ name: "", description: "", basePrice: "", durationHours: "", features: "", isActive: true })
    }
    setShowPackageModal(true)
  }

  // Handle form input change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (e.target instanceof HTMLInputElement) {
      if (e.target.type === "checkbox") {
        setFormData((prev) => ({
          ...prev,
          [name]: (e.target as HTMLInputElement).checked,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: String(value),
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: String(value),
      }))
    }
  }

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)

    // Basic validation
    if (!formData.name || !formData.basePrice || !formData.durationHours) {
      setFormError("Name, price, and duration are required.")
      setFormLoading(false)
      return
    }

    if (!user) {
      setFormError("User not found.")
      setFormLoading(false)
      return
    }

    const basePriceNum = Number.parseFloat(formData.basePrice)
    const durationNum = Number.parseInt(formData.durationHours)

    if (isNaN(basePriceNum) || isNaN(durationNum)) {
      setFormError("Base price and duration must be valid numbers.")
      setFormLoading(false)
      return
    }

    const data: any = {
      name: formData.name,
      description: formData.description,
      basePrice: basePriceNum,
      durationHours: durationNum,
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      isActive: formData.isActive,
    }

    // Only add these fields for create
    if (!editingPackage) {
      data["serviceProviderId"] = user.id
      data["serviceType"] = user.userType || user.role || "other"
    }

    try {
      if (editingPackage) {
        await handleUpdatePackage(editingPackage.id, data)
      } else {
        await handleCreatePackage(data)
      }
      setShowPackageModal(false)
      setEditingPackage(null)
    } catch (err: any) {
      setFormError(err.message || "Failed to save package")
    } finally {
      setFormLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (pkg: any) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      await handleDeletePackage(pkg.id)
    }
  }

  // Calculate average price of all packages
  const avgPrice = packages.length > 0
    ? 'Rs. ' + (packages.reduce((sum, pkg) => sum + (parseFloat(pkg.basePrice) || 0), 0) / packages.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : 'Rs. 0';

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center">
            <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
            My Packages
          </h2>
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
            onClick={() => openPackageModal(null)}
          >
            <Plus className="w-5 h-5" />
            <span>Add Package</span>
          </button>
        </div>

        {/* Package Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Total Packages</p>
                <p className="text-2xl font-bold text-slate-800">{packages?.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Active Packages</p>
                <p className="text-2xl font-bold text-slate-800">
                  {packages?.filter((pkg) => pkg.isActive).length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Avg. Price</p>
                <p className="text-2xl font-bold text-slate-800">
                  {avgPrice}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {packagesError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-red-800 font-medium">{packagesError}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {packagesLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        {/* Enhanced Package Cards */}
        <div className="grid gap-8">
          {packages &&
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {pkg.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pkg.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">{pkg.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Price</p>
                          <p className="font-bold text-slate-800">Rs. {pkg.basePrice?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Duration</p>
                          <p className="font-bold text-slate-800">{pkg.durationHours} hours</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Star className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Features</p>
                          <p className="font-bold text-slate-800">
                            {Array.isArray(pkg.features) ? pkg.features.length : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Features List */}
                    {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Features Included:</h4>
                        <div className="flex flex-wrap gap-2">
                          {pkg.features.map((feature: string, index: number) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 ml-8">
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 font-semibold flex items-center space-x-2"
                      onClick={() => openPackageModal(pkg)}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center space-x-2"
                      onClick={() => handleDelete(pkg)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          {!packagesLoading && (!packages || packages.length === 0) && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No packages yet</h3>
              <p className="text-slate-600 mb-6">Create your first package to start receiving bookings</p>
              <button
                onClick={() => openPackageModal(null)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Create Package
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal for create/edit */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onSubmit={handleFormSubmit}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
                {editingPackage ? "Edit Package" : "Create New Package"}
              </h2>
              <button
                type="button"
                onClick={() => setShowPackageModal(false)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-1 bg-red-100 rounded-full">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-red-800 font-medium">{formError}</div>
                </div>
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Package Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Premium Wedding Package"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows={3}
                  placeholder="Describe what's included in this package..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Base Price (Rs.)</label>
                  <input
                    name="basePrice"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.basePrice}
                    onChange={handleFormChange}
                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="50000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Duration (hours)</label>
                  <input
                    name="durationHours"
                    type="number"
                    min="1"
                    value={formData.durationHours}
                    onChange={handleFormChange}
                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="8"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Features (comma separated)</label>
                <input
                  name="features"
                  value={formData.features}
                  onChange={handleFormChange}
                  className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Professional photography, Edited photos, Online gallery, Print package"
                />
              </div>
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-slate-700">
                  Make this package active and visible to clients
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                onClick={() => setShowPackageModal(false)}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
                disabled={formLoading}
              >
                {formLoading ? "Saving..." : editingPackage ? "Update Package" : "Create Package"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default PackagesTab
