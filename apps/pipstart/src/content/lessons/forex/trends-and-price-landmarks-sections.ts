import type { LessonSection } from "../../lesson-content";

export const trendsAndLandmarksSections: LessonSection[] = [
  {
    title: "Use landmarks as descriptions",
    shortTitle: "Start with observation",
    blocks: [
      {
        type: "paragraph",
        children:
          "A price landmark is an area you choose to watch because of earlier observations. It might be a previous high, a previous low, an area of repeated pauses or a round number. A trend describes the arrangement of price movements over a chosen period. Both help organise a chart; neither forces the next price to behave in a particular way.",
      },
      {
        type: "paragraph",
        children:
          "This lesson develops a careful drawing routine. You will distinguish zones from exact lines, define the swings you use, and mark observations before revealing later data. You do not need a live order to learn this. A useful result is a chart annotation someone else can reproduce from your written rule.",
      },
      {
        type: "paragraph",
        children:
          "Always begin with the labels from the previous lesson: product, source, bid or ask versus another price basis, timeframe, date and time zone. Two analysts drawing on different windows may disagree because they are describing different records, not because one has discovered a universal hidden line.",
      },
      {
        type: "example",
        title: "A doorway can slow a crowd",
        children: [
          "A crowded doorway in a French shop may slow people for a moment, but a larger crowd can still pass through. An earlier pause on a chart can make an area worth watching; it does not turn the area into a wall.",
        ],
      },
    ],
  },
  {
    title: "Identify support and resistance zones",
    shortTitle: "Support and resistance",
    blocks: [
      {
        type: "paragraph",
        children:
          "Analysts often call an area support when earlier declines paused or turned upward near it. Resistance describes an area where earlier rises paused or turned downward. These labels refer to previous reactions in the chosen record. A fresh observation can pass straight through an old zone.",
      },
      {
        type: "paragraph",
        children:
          "Zones are often more honest than infinitely thin lines because reactions do not always happen at one exact price. Suppose two EUR/USD lows were 1.0994 and 1.1007. A proposed 1.0990–1.1010 zone groups them under a stated tolerance. That does not prove the zone will matter tomorrow; it identifies what you are choosing to watch.",
      },
      {
        type: "paragraph",
        children:
          "Previous extremes, consolidation areas and round numbers can attract analytical attention. However, more touches do not automatically create a stronger future barrier. Repeated visits can occur under changing conditions. The word “strong” should be tied to a defined measurement or treated as an opinion, not a fact.",
      },
      {
        type: "paragraph",
        children:
          "A broken resistance area is sometimes watched as possible support, and broken support as possible resistance. This role-reversal idea is a hypothesis for later observations. A return to the area need not happen, and a return does not have to produce a bounce.",
      },
      {
        type: "comparisonTable",
        caption: "Name the observation precisely",
        columns: ["Instead of this claim", "Write this description"],
        rows: [
          [
            "Support is exactly 1.1000",
            "Two selected lows fall inside the dated 1.0990–1.1010 zone.",
          ],
          [
            "Resistance cannot break",
            "Earlier selected rises paused inside this range.",
          ],
          [
            "The old level must reverse its role",
            "I will observe whether a later return reacts near the previous zone.",
          ],
          [
            "More touches prove strength",
            "I recorded this number of reactions under a specified definition.",
          ],
        ],
      },
    ],
  },
  {
    title: "Define the swings used to describe a trend",
    shortTitle: "Trend definitions",
    blocks: [
      {
        type: "paragraph",
        children:
          "A common uptrend description uses rising swing highs and rising swing lows. A downtrend uses falling highs and lows. A range describes repeated turns within an area without a sustained directional sequence under your chosen rule. Some periods are mixed or unclear, and “unclear” is an acceptable description.",
      },
      {
        type: "paragraph",
        children:
          "A swing is a selected local turning point. You need a consistent way to select it: for example, a high above the adjacent bars and confirmed only after the next bar, or a minimum price movement between turns. Different rules select different points. The next lesson develops the timing problem in detail.",
      },
      {
        type: "paragraph",
        children:
          "One higher low alone does not establish the entire uptrend description if the chosen rule also requires higher highs. A chart can make a higher high while its next low falls sharply. Write both observations rather than forcing the record into a familiar label.",
      },
      {
        type: "paragraph",
        children:
          "For invented EUR/USD daily closes 1.0800, 1.0850, 1.0820, 1.0900, 1.0860 and 1.0950, selected turning highs of 1.0850 and 1.0900 rise, and selected lows of 1.0820 and 1.0860 rise. The final 1.0950 is an endpoint, not yet a confirmed turning high under a rule requiring later evidence. The sequence suggests upward structure under the selected rule, but does not predict the next close.",
      },
      {
        type: "example",
        title: "A child’s height chart",
        children: [
          "A family in Canada plots a child’s measured height each year. A rising line summarises the earlier measurements, but does not reveal the exact height next Tuesday. A chart trend similarly organises past observations without becoming a timetable for future prices.",
        ],
      },
    ],
  },
  {
    title: "Draw a trend line with a written rule",
    shortTitle: "Trend lines",
    blocks: [
      {
        type: "paragraph",
        children:
          "A trend line connects selected points as a visual guide. For an upward structure, analysts commonly connect rising reaction lows; for a downward structure, falling reaction highs. At least two distinct anchors define a straight line, but a line through two points is easy to draw and is not independent evidence of predictive value.",
      },
      {
        type: "paragraph",
        children:
          "Write the anchor dates, prices, price basis and selection rule. State whether you join candle extremes or closing prices. If you switch from lows to closes whenever the line misses a convenient touch, another learner cannot reproduce it. Additional reactions may be observations to study, but the line still cannot make price obey it.",
      },
      {
        type: "paragraph",
        children:
          "The visual angle depends on chart scaling and spacing. Resizing the window changes how steep a line looks. Do not compare “45-degree” slopes across differently scaled charts as if the screen angle were a property of the market itself.",
      },
      {
        type: "paragraph",
        children:
          "Extending the line into the future is a geometric projection, not a forecast. Price may cross it because structure changed, because normal variation occurred, or because the drawing was arbitrary. A crossing alone does not prove why it happened or that a new trend is established.",
      },
      {
        type: "comparisonTable",
        caption: "Keep the drawing reproducible",
        columns: ["Item", "Record before later data appear"],
        rows: [
          ["Anchors", "Dates and prices of the selected points."],
          ["Price basis", "Lows, highs or closes from the same named feed."],
          ["Selection rule", "Which turns qualify and when they become known."],
          [
            "Crossing rule",
            "Intraperiod touch, completed close or another stated event.",
          ],
          [
            "Revision",
            "Save the old drawing before changing anchors or tolerance.",
          ],
        ],
      },
    ],
  },
  {
    title: "Describe a channel without treating it as a fence",
    shortTitle: "Channels",
    blocks: [
      {
        type: "paragraph",
        children:
          "A channel uses two approximate boundaries around a selected price path. A rising channel slopes upward, a falling one downward, and a sideways channel can describe a range. One possible construction draws a trend line through selected lows and a parallel line through a selected high. Other constructions are possible; record yours.",
      },
      {
        type: "paragraph",
        children:
          "The distance between lines depends on the anchors and scale. Later prices can move within, beyond or away from the channel. A wider channel after volatile moves is a changed description, not proof that the earlier boundaries were secretly correct. A narrowing channel also does not guarantee an imminent break in a particular direction.",
      },
      {
        type: "paragraph",
        children:
          "Keep horizontal zones, trend lines and channel boundaries conceptually separate. A horizontal zone refers to a price range across time; a trend line changes its projected price with time; a channel adds another boundary to that geometry. A line crossing a zone can be an area of analytical interest, but two drawings on the same data are not automatically two independent confirmations.",
      },
      {
        type: "diagram",
        src: "/images/lessons/forex/trends-and-price-landmarks-guide.svg",
        desktopSrc:
          "/images/lessons/forex/trends-and-price-landmarks-guide-desktop.svg",
        alt: "Three schematic views of the same kind of rising path: a horizontal zone of earlier reactions, a trend line joining selected rising lows, and a parallel channel around selected moves. Boundaries are annotations rather than barriers.",
        caption:
          "Schematic drawings, not live quotes. Record your anchors and rules; lines describe selected past data.",
        width: 600,
        height: 600,
      },
    ],
  },
  {
    title: "Choose the timeframe and context",
    shortTitle: "Context matters",
    blocks: [
      {
        type: "paragraph",
        children:
          "The same market can look upward over several daily bars and sideways during a few hourly bars. A lower-timeframe pullback can sit inside a higher-timeframe rising sequence. Name the window before deciding whether two descriptions conflict.",
      },
      {
        type: "paragraph",
        children:
          "Zooming out helps you see whether a chosen landmark was selected from a meaningful part of the available history. Zooming in can help inspect the individual reactions. Neither action supplies a universal best lookback. Define the lookback before judging a later outcome, rather than extending it until a pleasing example appears.",
      },
      {
        type: "paragraph",
        children:
          "News, holidays, spread changes and a different feed can affect what you observe or could execute. A bid close beyond a zone and an ask spike through it are different records. When planning a reading exercise, specify whether only completed candles count and how missing observations are treated.",
      },
      {
        type: "paragraph",
        children:
          "You do not need dozens of coloured lines. Start with two selected highs, two selected lows and one zone. Too many overlapping annotations make it easy to claim that any later turn respected something. Keep the original chart available so you can tell a genuine prewritten observation from a later explanation.",
      },
      {
        type: "example",
        title: "A journey has different scales",
        children: [
          "A Mexican traveller’s route can head north over a whole day while the car briefly turns east to reach a fuel station. Both descriptions can be correct because the windows differ. A daily uptrend and an hourly sideways period need the same clear context.",
        ],
      },
    ],
  },
  {
    title: "Turn a vague level into an observable event",
    shortTitle: "Touches and breaks",
    blocks: [
      {
        type: "paragraph",
        children:
          "“Price is near support” is incomplete. State the zone, tolerance, chosen price and event. For a EUR/USD zone of 1.0990–1.1010, a bid low at 1.1005 enters the zone. A completed bid close at 1.0985 falls below its lower boundary. Those are two observations you can verify; neither independently predicts the next session.",
      },
      {
        type: "paragraph",
        children:
          "A wick touching the zone, a close inside it and a close beyond it are different events. If your rule defines a break by a completed close, an intraperiod move alone does not qualify. If you use a buffer, specify it in price units or pips before seeing the result.",
      },
      {
        type: "paragraph",
        children:
          "For example, a close more than five conventional EUR/USD pips below the lower boundary would need to be below 1.0985, not merely equal to it, under a strict “more than” rule. An inclusive “at least five pips” condition includes equality. Small wording differences can change the label assigned to an observation.",
      },
      {
        type: "paragraph",
        children:
          "The point is to make the observation reproducible. You are not being asked to find the buffer that will make a trade work. Testing any trading response requires additional entry, exit, sizing and cost rules, which are separate from naming a chart event.",
      },
      {
        type: "takeaway",
        title: "Remember",
        children:
          "A landmark becomes a usable observation only after you state which price, which interval and which event count.",
      },
    ],
  },
  {
    title: "A real-life worked example",
    shortTitle: "Worked example",
    blocks: [
      {
        type: "paragraph",
        children:
          "A Mexican learner plots invented USD/MXN daily lows of 17.1, 17.3, 17.4 and 17.6 on their respective dates. The selected lows rise. To call the full record an uptrend under a highs-and-lows rule, they also need the selected highs; the lows alone do not answer that question.",
      },
      {
        type: "paragraph",
        children:
          "They draw a guide through two dated lows and retain the other observations. A later low near 17.5 is below the latest 17.6 low, though still above some earlier lows. The learner records that mixed detail instead of stretching the line so that every point appears to fit. A previous drawing does not create a floor at 17.5.",
      },
      {
        type: "paragraph",
        children:
          "A German learner separately marks EUR/USD support as 1.0990–1.1010 before revealing the next day. The next bid low is 1.1005 and the completed bid close is 1.0985. The record entered the zone and closed below it. Whether a response would have been sensible cannot be decided from the annotation alone; costs and executable quotes are still needed.",
      },
      {
        type: "comparisonTable",
        caption: "Separate observation from prediction",
        columns: [
          "Available evidence",
          "Accurate conclusion",
          "Conclusion not established",
        ],
        rows: [
          [
            "Selected USD/MXN lows rise",
            "Those chosen lows form a rising sequence.",
            "The next low cannot fall.",
          ],
          [
            "A dated EUR/USD close is below a marked zone",
            "The chosen close-based break condition is met.",
            "The next day must continue downward.",
          ],
          [
            "Price crosses a projected guide",
            "The drawing and selected price intersected.",
            "A profitable reversal is guaranteed.",
          ],
        ],
      },
    ],
  },
  {
    title: "Practise drawing before revealing the next bar",
    shortTitle: "Practice and answers",
    blocks: [
      {
        type: "exercise",
        prompt:
          "Choose a completed historical segment or invented prices. Label the chart and save it before viewing later observations. Mark two highs, two lows and one zone under a written selection rule. Record the anchors, tolerance and event that would count as a break. Then reveal one new bar without redrawing the original.",
      },
      {
        type: "example",
        title: "Check your reasoning",
        children: [
          "Two rising lows do not alone prove a higher-highs-and-higher-lows trend. A 1.1005 low enters the stated 1.0990–1.1010 zone; a 1.0985 close is below it. A strict “more than five pips below 1.0990” condition excludes a close exactly at 1.0985. Changing anchors after seeing a reversal changes the experiment.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Write a short observation note and a separate uncertainty note. If you revise a zone, date the revision and retain the original. This turns a drawing session into a truthful learning record. You can then compare later observations without pretending that every convenient line existed beforehand.",
      },
    ],
  },
  {
    title: "References and before moving on",
    shortTitle: "Before moving on",
    blocks: [
      {
        type: "riskStatement",
        children:
          "Educational observations and hypothetical data only. Chart shapes, volume, landmarks and calculators do not guarantee future prices, execution or profits. Leveraged Forex can cause substantial losses; no live order is needed for these exercises.",
      },
      {
        type: "keyPoint",
        title: "I can explain this without guessing",
        points: [
          "I can distinguish a horizontal reaction zone, a trend line and a channel.",
          "I can identify the swing and timeframe rules behind an upward, downward, ranging or unclear description.",
          "I can record anchors, price basis and tolerance before viewing later data.",
          "I can distinguish a wick touch from a completed close beyond a zone.",
          "I understand why a past reaction and a projected line do not guarantee future behaviour.",
        ],
      },
      {
        type: "references",
        items: [
          {
            title: "CME Group — Support and Resistance",
            url: "https://www.cmegroup.com/education/courses/trading-and-analysis/support-and-resistance",
          },
          {
            title: "CME Group — Technical Analysis",
            url: "https://www.cmegroup.com/education/courses/technical-analysis",
          },
          {
            title: "CME Group — Chart Types: candlestick, line, bar",
            url: "https://www.cmegroup.com/education/courses/technical-analysis/chart-types-candlestick-line-bar",
          },
        ],
      },
    ],
  },
];
