/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { supabase } from "@/config/Supabase_Client";
import useUser from "@/hooks/useUser";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Wrapper from "@/app/components/Wrapper";
import Header from "@/app/components/Header";
import Snippet from "@/app/components/Snippet";
import ApiSnipet from "@/app/components/api-snippet";


function WebsitePage() {
  const { website } = useParams();
  const [user] = useUser();
  const router = useRouter();
  const [pageViews, setPageViews] = useState([]);
  const [totalVisits, setTotalVisits] = useState();
  const [customEvents, setCustomEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedPageViews, setGroupedPageViews] = useState([]);
  const [groupedPageSources, setGroupedPageSources] = useState([]);
  const [groupedCustomEvents, setGroupedCustomEvents] = useState([]);
  const [activeCustomEventTab, setActiveCustomEventTab] = useState("");
  const [filterValue, setFilterValue] = useState(0);
  useEffect(() => {
    //   make sure the user is loggedin first
    if (!user) return;
    if (user.role !== "authenticated") router.push("/signin");
    const checkWebsiteCurrentUser = async () => {
      // check if the current user is the owner of this website or not
      const { data, error } = await supabase
        .from("websites")
        .select()
        .eq("website_name", website)
        .eq("user_id", user.id);
      // if not go to the dashboard if yeas send other request to get the views
      data?.length == 0
        ? router.push("/dashboard") 
        : setTimeout(() => {
          fetchViews();
        }, 500);
    };
    checkWebsiteCurrentUser();
  }, [user]);
  const fetchViews = async (filter_duration) => {
    setLoading(true);
    const ThatTimeAgo = new Date();
    if (filter_duration) {
      const onlyNumber_filter_duration = parseInt(
        filter_duration.match(/\d+/)[0]
      );
      ThatTimeAgo.setDate(ThatTimeAgo.getDate() - onlyNumber_filter_duration);
    }
    try {
      // Send multiple requests in parallel using Promise.all()
      const [viewsResponse, visitsResponse, customEventsResponse] =
        filter_duration
          ? await Promise.all([
            supabase
              .from("page_views")
              .select()
              .eq("domain", website)
              .filter("created_at", "gte", ThatTimeAgo.toISOString()),
            supabase
              .from("visits")
              .select()
              .eq("website_domain", website)
              .filter("created_at", "gte", ThatTimeAgo.toISOString()),
            supabase
              .from("events")
              .select()
              .eq("website_domain", website)
              .filter("created_at", "gte", ThatTimeAgo.toISOString()),
          ])
          : await Promise.all([
            supabase.from("page_views").select().eq("domain", website),
            supabase.from("visits").select().eq("website_domain", website),
            supabase.from("events").select().eq("website_domain", website),
          ]);

      // Extract data from responses
      const views = viewsResponse.data;
      const visits = visitsResponse.data;
      const customEventsData = customEventsResponse.data;

      // Update state with the fetched data
      setPageViews(views);
      setGroupedPageViews(groupPageViews(views));
      setTotalVisits(visits);
      setGroupedPageSources(groupPageSources(visits));
      setCustomEvents(customEventsData);
      // grouping the customEvent by name
      setGroupedCustomEvents(
        customEventsData?.reduce((acc, event) => {
          acc[event.event_name] = (acc[event.event_name] || 0) + 1;
          return acc;
        }, {})
      );
    } catch (error) {
      // Handle errors
      console.error("Error fetching views:", error);
    } finally {
      setLoading(false);
    }
  };

  // handle the format of the numbers/counts
  const abbreviateNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K";
    } else {
      return number?.toString();
    }
  };

  // group the page views with paths
  function groupPageViews(pageViews) {
    const groupedPageViews = {};

    pageViews && pageViews?.forEach(({ page }) => {
      // Extract the path from the page URL by removing the protocol and hostname
      const path = page?.replace(/^(?:\/\/|[^/]+)*\//, "");

      // Increment the visit count for the page path
      groupedPageViews[path] = (groupedPageViews[path] || 0) + 1;
    });

    return Object.keys(groupedPageViews).map((page) => ({
      page: page,
      visits: groupedPageViews[page],
    }));
  }
  // group the sources with paths
  function groupPageSources(visits) {
    const groupedPageSources = {};

    visits && visits?.forEach(({ source }) => {
      groupedPageSources[source] = (groupedPageSources[source] || 0) + 1;
    });

    return Object.keys(groupedPageSources).map((source) => ({
      source: source,
      visits: groupedPageSources[source],
    }));
  }
  const formatTimeStampz = (date) => {
    const timestamp = new Date(date);

    // Step 2: Format the Date object into a human-readable format
    const formattedTimestamp = timestamp.toLocaleString();
    return formattedTimestamp;
  };
  useEffect(() => {
    if (!supabase || !website) return;
    // refreshing the page after 30 seconds to pull updated numbers
    setInterval(() => {
      setFilterValue(0);
      fetchViews();
    }, 30000);
  }, [website, supabase]);

  if (loading) {
    return (
      <Wrapper>
        <Header />
        <div
          className="min-h-screen w-full items-center justify-center
         flex text-white relative"
        >
          loading...
        </div>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <Header />
      {pageViews?.length == 0 && !loading ? (
        <div
          className="w-full items-center justify-center flex
         flex-col space-y-6 z-40 relative min-h-screen px-4"
        >
          <div
            className="z-40 w-full lg:w-2/3 bg-black border border-white/5 py-12 px-8 
        items-center justify-center flex flex-col text-white space-y-4 relative"
          >
            <p className="bg-green-600 rounded-full p-4 animate-pulse" />
            <p className="animate-pulse">waiting for the first page view</p>
            <button className="button" onClick={() => window.location.reload()}>
              refresh
            </button>
            <div className="w-full md:w-3/4 z-40 pb-6 border border-white/5 mt-12s">
              <Snippet />
            </div>
          </div>
        </div>
      ) : (
        // let's monitor
        <div
          className="z-40 w-[95%] md:w-3/4 lg:w-2/3 min-h-screen py-6 border-x border-white/5
        items-center justify-start flex flex-col"
        >
          <span className="text-white w-full items-center justify-end flex px-12 space-x-5">
            <Select
              onValueChange={(value) => {
                fetchViews(value);
                setFilterValue(value);
              }}
            >
              <SelectTrigger
                className="w-[180px] border border-white/5 
              outline-none hover:border-white/20 smooth"
              >
                <SelectValue
                  placeholder={filterValue ? filterValue : "lifetime"}
                  className="text-white"
                />
              </SelectTrigger>
              <SelectContent
                className="bg-black border
               border-white/10 bg-opacity-20 filter backdrop-blur-lg"
              >
                <SelectItem className="filter_tab_item" value={0}>
                  LifeTime
                </SelectItem>
                <SelectItem className="filter_tab_item" value="last 7 days">
                  Last 7 days
                </SelectItem>
                <SelectItem className="filter_tab_item" value="last 30 days">
                  Last 30 days
                </SelectItem>
                <SelectItem className="filter_tab_item" value="last 60 days">
                  Last 60 days
                </SelectItem>
                <SelectItem className="filter_tab_item" value="last 90 days">
                  Last 90 days
                </SelectItem>
                <SelectItem className="filter_tab_item" value="last 180 days">
                  Last 180 days
                </SelectItem>
              </SelectContent>
            </Select>

            <ArrowPathIcon
              onClick={() => fetchViews()}
              className="h-4 w-4 stroke-white/60 hover:stroke-white smooth cursor-pointer z-50"
            />
          </span>
          <div className="w-full items-center justify-center flex">
            <Tabs
              defaultValue="general"
              className="w-full items-center justify-center flex flex-col"
            >
              <TabsList className="w-full text-white bg-transparent mb-4 items-start justify-start flex">
                <TabsTrigger value="general">general</TabsTrigger>
                <TabsTrigger value="custom Events">custom Events</TabsTrigger>
              </TabsList>
              <TabsContent className="w-full" value="general">
                <div className="w-full"></div>
                <div
                  className="w-full grid grid-cols-1 md:grid-cols-2 px-4
           gap-6"
                >
                  <div className="bg-black border-white/5 border text-white text-center">
                    <p className="text-white/70 font-medium py-8 w-full text-center border-b border-white/5">
                      TOTAL VISITS
                    </p>
                    <p className="py-12 text-3xl lg:text-4xl font-bold bg-[#050505]">
                      {abbreviateNumber(totalVisits?.length)}
                    </p>
                  </div>
                  <div className="bg-black border-white/5 border text-white text-center">
                    <p className="font-medium text-white/70 py-8  w-full text-center border-b border-white/5">
                      PAGE VIEWS
                    </p>
                    <p className="py-12 text-3xl lg:text-4xl font-bold bg-[#050505]">
                      {abbreviateNumber(pageViews?.length)}
                    </p>
                  </div>
                </div>
                <div
                  className="items-center justify-center grid grid-cols-1 bg-black 
           lg:grid-cols-2 mt-12 w-full border-y border-white/5"
                >
                  {/* top pages */}
                  <div className="flex flex-col bg-black z-40 h-full w-full">
                    <h1 className="label">Top Pages</h1>
                    {groupedPageViews.map((view) => (
                      <div
                        key={view}
                        className="text-white w-full items-center justify-between 
                  px-6 py-4 border-b border-white/5 flex"
                      >
                        <p className="text-white/70 font-light">/{view.page}</p>
                        <p className="">{abbreviateNumber(view.visits)}</p>
                      </div>
                    ))}
                  </div>
                  {/* top sources */}
                  <div
                    className="flex flex-col bg-black z-40 h-full w-full
             lg:border-l border-t lg:border-t-0 border-white/5"
                  >
                    <h1 className="label relative">
                      Top Visit Sources
                      <p className="absolute bottom-2 right-2 text-[10px] italic font-light">
                        add ?utm={"{source}"} to track
                      </p>
                    </h1>
                    {groupedPageSources.map((pageSource) => (
                      <div
                        key={pageSource}
                        className="text-white w-full items-center justify-between 
                  px-6 py-4 border-b border-white/5 flex"
                      >
                        <p className="text-white/70 font-light">
                          /{pageSource.source}
                        </p>
                        <p className="text-white/70 font-light">
                          <span className="">
                            {abbreviateNumber(pageSource.visits)}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent className="w-full text-white" value="custom Events">
                {/* grid of customEvents */}
                {groupedCustomEvents > 0 ? (
                  <Carousel className="w-full px-4">
                    <CarouselContent>
                      {Object.entries(groupedCustomEvents).map(
                        ([eventName, count]) => (
                          <CarouselItem
                            key={`${eventName}-${count}`}
                            className="basis-1/2"
                          >
                            <div
                              className={`bg-black smooth group hover:border-white/10
                             text-white text-center border ${activeCustomEventTab == eventName
                                  ? "border-white/10"
                                  : "border-white/5 cursor-pointer"
                                } `}
                              onClick={() => setActiveCustomEventTab(eventName)}
                            >
                              <p
                                className={`text-white/70 font-medium py-8 w-full
                                 group-hover:border-white/10
                                smooth text-center border-b ${activeCustomEventTab == eventName
                                    ? "border-white/10"
                                    : "border-white/5 cursor-pointer"
                                  }`}
                              >
                                {eventName}
                              </p>
                              <p className="py-12 text-3xl lg:text-4xl font-bold bg-[#050505]">
                                {count}
                              </p>
                            </div>
                          </CarouselItem>
                        )
                      )}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                ) : (<div
                  className="w-full items-center justify-center flex
                 flex-col space-y-6 z-40 relative min-h-screen px-4"
                >
                  <div
                    className="z-40 w-full lg:w-2/3 bg-black border border-white/5 py-12 px-8 
                items-center justify-center flex flex-col text-white space-y-4 relative"
                  >
                    <p className="bg-green-600 rounded-full p-4 animate-pulse" />
                    <p className="animate-pulse">Listening for events</p>
                    <button className="button" onClick={() => window.location.reload()}>
                      refresh
                    </button>
                    <div className="w-full md:w-3/4 z-40 pb-6 border border-white/5 mt-12s">
                      <ApiSnipet />
                    </div>
                  </div>
                </div>)}
                {/* display events with messages */}
                <div
                  className="items-center justify-center bg-black mt-12
                 w-full border-y border-white/5 relative"
                >
                  {activeCustomEventTab !== "" && (
                    <button
                      className="button absolute right-0 z-50"
                      onClick={() => setActiveCustomEventTab("")}
                    >
                      all
                    </button>
                  )}
                  <div className="flex flex-col bg-black z-40 h-full w-full">
                    {customEvents?.filter((item) =>
                        activeCustomEventTab
                          ? item.event_name == activeCustomEventTab
                          : item
                      )
                      .map((event) => (
                        <div
                          key={event.id}
                          className={`text-white w-full items-start justify-start 
                  px-6 py-12 border-b border-white/5 flex flex-col relative`}
                        >
                          <p className="text-white/70 font-light pb-3">
                            {event.event_name}
                          </p>
                          <p className="">{event.message}</p>
                          <p className="italic absolute right-2 bottom-2 text-xs text-white/50">
                            {formatTimeStampz(event.timestamp)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </Wrapper>
  );
}

export default WebsitePage;
