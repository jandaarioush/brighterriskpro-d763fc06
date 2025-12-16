export type MarketRegion = 'brazil' | 'north-america' | 'europe' | 'asia';

export interface MarketSession {
  id: string;
  name: string;
  abbreviation: string;
  openTime: string;  // "HH:MM" em BRT
  closeTime: string; // "HH:MM" em BRT
  color: string;
  crossesMidnight?: boolean;
  region: MarketRegion;
}

export const MARKET_REGIONS: Record<MarketRegion, { label: string; emoji: string }> = {
  brazil: { label: 'Brasil', emoji: '🇧🇷' },
  'north-america': { label: 'EUA', emoji: '🇺🇸' },
  europe: { label: 'Europa', emoji: '🇪🇺' },
  asia: { label: 'Ásia', emoji: '🇯🇵' },
};

export const MARKET_SESSIONS: MarketSession[] = [
  {
    id: 'b3-futuro',
    name: 'B3 Futuro',
    abbreviation: 'B3F',
    openTime: '09:00',
    closeTime: '18:30',
    color: 'hsl(142, 76%, 36%)',
    region: 'brazil',
  },
  {
    id: 'b3-vista',
    name: 'B3 À Vista',
    abbreviation: 'B3V',
    openTime: '10:00',
    closeTime: '17:55',
    color: 'hsl(142, 69%, 58%)',
    region: 'brazil',
  },
  {
    id: 'nyse',
    name: 'Nova York',
    abbreviation: 'NYSE',
    openTime: '10:30',
    closeTime: '17:00',
    color: 'hsl(217, 91%, 60%)',
    region: 'north-america',
  },
  {
    id: 'lse',
    name: 'Londres',
    abbreviation: 'LSE',
    openTime: '04:00',
    closeTime: '12:30',
    color: 'hsl(45, 93%, 47%)',
    region: 'europe',
  },
  {
    id: 'tse',
    name: 'Tóquio',
    abbreviation: 'TSE',
    openTime: '21:00',
    closeTime: '03:00',
    color: 'hsl(330, 81%, 60%)',
    crossesMidnight: true,
    region: 'asia',
  },
  {
    id: 'xetra',
    name: 'Frankfurt',
    abbreviation: 'XETRA',
    openTime: '04:00',
    closeTime: '13:30',
    color: 'hsl(25, 95%, 53%)',
    region: 'europe',
  },
];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function isMarketOpen(session: MarketSession, currentTime: Date): boolean {
  const currentMinutes = dateToMinutes(currentTime);
  const openMinutes = timeToMinutes(session.openTime);
  const closeMinutes = timeToMinutes(session.closeTime);
  
  // Check if it's a weekday (Monday = 1, Friday = 5)
  const dayOfWeek = currentTime.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  
  if (!isWeekday) return false;
  
  if (session.crossesMidnight) {
    // Market crosses midnight (e.g., Tokyo: 21:00 - 03:00)
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

export function getTimeUntilChange(
  session: MarketSession, 
  currentTime: Date
): { hours: number; minutes: number; isUntilOpen: boolean } {
  const currentMinutes = dateToMinutes(currentTime);
  const openMinutes = timeToMinutes(session.openTime);
  const closeMinutes = timeToMinutes(session.closeTime);
  const isOpen = isMarketOpen(session, currentTime);
  
  let targetMinutes: number;
  
  if (isOpen) {
    // Calculate time until close
    if (session.crossesMidnight && currentMinutes < closeMinutes) {
      targetMinutes = closeMinutes;
    } else if (session.crossesMidnight) {
      targetMinutes = closeMinutes + 24 * 60;
    } else {
      targetMinutes = closeMinutes;
    }
  } else {
    // Calculate time until open
    if (currentMinutes < openMinutes) {
      targetMinutes = openMinutes;
    } else {
      targetMinutes = openMinutes + 24 * 60; // Next day
    }
  }
  
  let diff = targetMinutes - currentMinutes;
  if (diff < 0) diff += 24 * 60;
  
  return {
    hours: Math.floor(diff / 60),
    minutes: diff % 60,
    isUntilOpen: !isOpen,
  };
}

export function getOverlappingSessions(currentTime: Date): string[] {
  const openSessions = MARKET_SESSIONS.filter(s => isMarketOpen(s, currentTime));
  
  if (openSessions.length < 2) return [];
  
  const overlaps: string[] = [];
  
  // Check for Brazilian market overlaps with international
  const b3Open = openSessions.some(s => s.id.startsWith('b3'));
  const nyseOpen = openSessions.some(s => s.id === 'nyse');
  const lseOpen = openSessions.some(s => s.id === 'lse');
  
  if (b3Open && nyseOpen) {
    overlaps.push('B3 e Nova York [10:30 - 17:00]');
  }
  if (b3Open && lseOpen) {
    overlaps.push('B3 e Londres [09:00 - 12:30]');
  }
  if (nyseOpen && lseOpen) {
    overlaps.push('Nova York e Londres [10:30 - 12:30]');
  }
  
  return overlaps;
}

export function getTimelinePosition(time: string): number {
  const minutes = timeToMinutes(time);
  return (minutes / (24 * 60)) * 100;
}

export function getCurrentTimePosition(date: Date): number {
  const minutes = dateToMinutes(date);
  return (minutes / (24 * 60)) * 100;
}

export interface MarketEvent {
  marketId: string;
  marketName: string;
  marketAbbreviation: string;
  marketColor: string;
  eventType: 'open' | 'close';
  eventTime: string;
  minutesUntil: number;
}

export function getUpcomingEvents(
  currentTime: Date, 
  limit: number = 5,
  filteredMarkets?: MarketSession[]
): MarketEvent[] {
  const events: MarketEvent[] = [];
  const currentMinutes = dateToMinutes(currentTime);
  const sessions = filteredMarkets || MARKET_SESSIONS;

  sessions.forEach((session) => {
    const openMinutes = timeToMinutes(session.openTime);
    const closeMinutes = timeToMinutes(session.closeTime);
    const isOpen = isMarketOpen(session, currentTime);

    // Calculate minutes until open
    let minutesUntilOpen: number;
    if (currentMinutes < openMinutes) {
      minutesUntilOpen = openMinutes - currentMinutes;
    } else {
      minutesUntilOpen = (24 * 60) - currentMinutes + openMinutes;
    }

    // Calculate minutes until close
    let minutesUntilClose: number;
    if (session.crossesMidnight) {
      if (currentMinutes >= openMinutes) {
        // After open, before midnight
        minutesUntilClose = (24 * 60) - currentMinutes + closeMinutes;
      } else if (currentMinutes < closeMinutes) {
        // After midnight, before close
        minutesUntilClose = closeMinutes - currentMinutes;
      } else {
        // Market is closed
        minutesUntilClose = (24 * 60) - currentMinutes + closeMinutes;
      }
    } else {
      if (currentMinutes < closeMinutes) {
        minutesUntilClose = closeMinutes - currentMinutes;
      } else {
        minutesUntilClose = (24 * 60) - currentMinutes + closeMinutes;
      }
    }

    // Add the next relevant event
    if (isOpen) {
      // Market is open, next event is close
      events.push({
        marketId: session.id,
        marketName: session.name,
        marketAbbreviation: session.abbreviation,
        marketColor: session.color,
        eventType: 'close',
        eventTime: session.closeTime,
        minutesUntil: minutesUntilClose,
      });
    } else {
      // Market is closed, next event is open
      events.push({
        marketId: session.id,
        marketName: session.name,
        marketAbbreviation: session.abbreviation,
        marketColor: session.color,
        eventType: 'open',
        eventTime: session.openTime,
        minutesUntil: minutesUntilOpen,
      });
    }
  });

  // Sort by minutes until event and limit
  return events.sort((a, b) => a.minutesUntil - b.minutesUntil).slice(0, limit);
}
