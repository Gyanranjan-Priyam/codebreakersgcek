"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Announcement {
  id: string;
  slugId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  hasAttachments: boolean;
  hasImages: boolean;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAnnouncements();
  }, [category, currentPage]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "10",
        page: currentPage.toString(),
      });

      if (category !== "all") {
        params.append("category", category);
      }

      const response = await fetch(`/api/announcements/public?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.data.announcements);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'normal': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'low': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'emergency': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'system': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'event': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'academic': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'general': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'emergency': return '🚨';
      case 'system': return '⚙️';
      case 'event': return '🎉';
      case 'academic': return '📚';
      case 'general': return '📢';
      default: return '📢';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stay updated with the latest news, events, and important information from CodeBreakers
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[200px] bg-gray-800/50 border-gray-700 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                <SelectItem value="SYSTEM">System</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="ACADEMIC">Academic</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {loading ? "Loading..." : `${pagination.totalCount} announcement${pagination.totalCount !== 1 ? 's' : ''} found`}
            </span>
            {pagination.totalPages > 1 && (
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            )}
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
                  <Skeleton className="h-4 w-2/3 bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No announcements found</h3>
              <p className="text-gray-400 text-center">
                {searchQuery ? "Try adjusting your search or filters" : "Check back later for updates"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <Link key={announcement.id} href={`/announcement/${announcement.slugId}`}>
                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-1">{getCategoryIcon(announcement.category)}</span>
                          <div className="flex-1">
                            <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                              {announcement.title}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge className={getPriorityColor(announcement.priority)}>
                                {announcement.priority}
                              </Badge>
                              <Badge className={getCategoryColor(announcement.category)}>
                                {announcement.category.replace('_', ' ')}
                              </Badge>
                              {announcement.hasAttachments && (
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                  📎 Attachments
                                </Badge>
                              )}
                              {announcement.hasImages && (
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                  🖼️ Images
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors shrink-0" />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(announcement.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(announcement.createdAt), "hh:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-blue-400">
                        #{announcement.slugId}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPreviousPage}
              className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={currentPage === pageNumber 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                    }
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage}
              className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
