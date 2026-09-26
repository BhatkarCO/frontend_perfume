"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Instagram,
  Heart,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/utils/api";

export default function InstagramFeed() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("bhatkarco.official");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      try {
        const response = await api.get("/instagram/feed");

        const data = response.data;

        const validPosts = Array.isArray(data?.posts)
          ? data.posts.filter(
              (post) =>
                post?.permalink && (post?.media_url || post?.thumbnail_url),
            )
          : [];

        setPosts(validPosts);

        if (data?.username) {
          setUsername(data.username);
        }
      } catch (err) {
        console.error("Instagram feed error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramFeed();
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white border-t border-luxury-lightgrey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="h-3 w-32 bg-luxury-lightgrey animate-pulse mx-auto mb-4 rounded" />

            <div className="h-8 w-64 bg-luxury-lightgrey animate-pulse mx-auto rounded" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-square bg-luxury-lightgrey animate-pulse rounded-sm"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white border-t border-luxury-lightgrey overflow-hidden">
      {/* ================================
          HEADING
      ================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 flex flex-col items-center"
        >
          <div className="flex items-center gap-2 text-gold mb-3">
            <Instagram className="w-4 h-4" />

            <span className="text-[10px] uppercase tracking-[0.35em] font-bold">
              From Our Instagram
            </span>
          </div>

          <h2 className="font-playfair text-2xl sm:text-3xl font-bold tracking-wider uppercase">
            Follow Our Journey
          </h2>

          <div className="w-16 h-0.5 bg-gold mt-3 mb-4" />

          <a
            href={`https://www.instagram.com/${username}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gold transition-colors tracking-wide"
          >
            @{username}
          </a>
        </motion.div>
      </div>

      {/* ================================
          FULL-WIDTH CAROUSEL
      ================================= */}
      <div className="relative group w-full px-8 sm:px-16 lg:px-20">
        {/* LEFT ARROW */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous Instagram posts"
          className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 rounded-full bg-white/95 border border-luxury-lightgrey
            shadow-md flex items-center justify-center
            text-luxury-black hover:text-gold hover:border-gold
            transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* POSTS */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
        >
          {posts.map((post, index) => {
            const isVideo = post.media_type === "VIDEO";

            return (
              <motion.div
                key={post.id || index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.05,
                }}
                className="group/post shrink-0 w-[72vw] sm:w-[290px] md:w-[270px] lg:w-[280px]"
              >
                {/* ============================
                    MEDIA
                ============================= */}
                <div
                  className="relative aspect-[4/5] overflow-hidden
  bg-luxury-deep rounded-sm border border-luxury-lightgrey"
                  onMouseEnter={() => {
                    if (isVideo) {
                      setHoveredVideoId(post.id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isVideo) {
                      setHoveredVideoId(null);
                    }
                  }}
                >
                  {isVideo ? (
                    <video
                      src={post.media_url || undefined}
                      poster={post.thumbnail_url || undefined}
                      controls={hoveredVideoId === post.id}
                      controlsList="nodownload"
                      disablePictureInPicture
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <>
                      <img
                        src={post.media_url}
                        alt={post.caption || "Bhatkar & Co. Instagram post"}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/post:scale-105"
                      />

                      {/* Image Hover Overlay */}
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View post on Instagram"
                        className="absolute inset-0 bg-black/0
                          group-hover/post:bg-black/45
                          transition-all duration-500
                          flex items-center justify-center"
                      >
                        <span
                          className="opacity-0 group-hover/post:opacity-100
                            transition-all duration-300
                            flex items-center gap-2 text-white"
                        >
                          <Instagram className="w-5 h-5" />

                          <span className="text-[10px] uppercase tracking-widest font-bold">
                            View on Instagram
                          </span>
                        </span>
                      </a>
                    </>
                  )}

                  {/* Reel Badge */}
                  {isVideo && (
                    <div
                      className="absolute top-3 right-3 px-2 py-1
                        bg-black/70 text-white text-[8px]
                        uppercase tracking-widest font-bold
                        pointer-events-none"
                    >
                      Reel
                    </div>
                  )}
                </div>

                {/* ============================
                    POST META
                ============================= */}
                <div className="flex items-center justify-between mt-3 px-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Heart className="w-3.5 h-3.5" />

                    <span className="text-[9px]">{post.like_count ?? 0}</span>
                  </div>

                  <span className="text-[9px] text-gray-400">
                    {formatDate(post.timestamp)}
                  </span>
                </div>

                {/* ============================
                    VIEW ON INSTAGRAM
                ============================= */}
                <div className="mt-2 px-1">
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5
                      text-[8px] uppercase tracking-widest
                      font-bold text-gold hover:text-gold-dark
                      transition-colors"
                  >
                    <Instagram className="w-3 h-3" />
                    View on Instagram
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT ARROW */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next Instagram posts"
          className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 rounded-full bg-white/95 border border-luxury-lightgrey
            shadow-md flex items-center justify-center
            text-luxury-black hover:text-gold hover:border-gold
            transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ================================
          INSTAGRAM CTA
      ================================= */}
      <div className="flex justify-center mt-10">
        <a
          href={`https://www.instagram.com/${username}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2
            border border-gold/50
            text-gold hover:bg-gold hover:text-white
            px-6 py-3 rounded-sm
            text-[10px] uppercase tracking-widest
            font-bold transition-all duration-300"
        >
          <Instagram className="w-4 h-4" />
          Follow @{username}
        </a>
      </div>
    </section>
  );
}
