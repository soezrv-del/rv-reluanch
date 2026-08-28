# RvCal money slider — taller wheel + $1k / $5k / $10k

## Why it felt stuck
The old control is a **thin horizontal track** inside a page `ScrollView`. Your finger often moves the page instead of the price, so it feels like “scroll does nothing.”

## Fix
1. **Taller vertical wheel** (~168px) so there is real room to drag.
2. **Gesture capture** so the page does not steal the swipe while you are on the wheel.
3. **Velocity steps**
   | Speed | Jump |
   | --- | --- |
   | Slow | $1,000 |
   | Medium | $5,000 |
   | Fast | $10,000 |

## Install
1. Copy:
   ```text
   components/feature/PriceMoneySlider.tsx
   ```
2. In `app/(tabs)/rvcal.tsx`:
   - Import:
     ```tsx
     import { PriceMoneySlider } from '@/components/feature/PriceMoneySlider';
     ```
   - Replace the old `<PriceSlider … />` under Selling Price with:
     ```tsx
     <PriceMoneySlider
       value={price}
       onChange={(v) => setPriceText(String(v))}
       label="Swipe to set selling price"
     />
     ```
3. Same component can drive trade value / trade payoff if you convert those fields from text to number state later.
4. Reload:
   ```bash
   npx expo start -c
   ```

## Optional: parent ScrollView
If the page still steals rare gestures, wrap the main ScrollView with:
```tsx
scrollEnabled={!draggingMoney}
```
and pass `onDragStart` / `onDragEnd` from the wheel (easy follow-up).
