
import requests
from bs4 import BeautifulSoup

#function to scrape the UMSU website 
def get_umsu_events():

    events_results = []    
    url = "https://umsu.ca/events/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    articles = soup.find_all('article')

    for art in articles:
        try:
            # Get the title and the details link
            link_tag = art.find('a', class_='tribe-events-pro-photo__event-title-link')
            title = link_tag.get_text(strip=True)
            detail_url = link_tag['href']
            
            # get the image url 
            img_tag = art.find('img', class_='tribe-events-pro-photo__event-featured-image')
            image_url = img_tag['src'] if img_tag else "default.jpg" # if no image get the default.jpg

            # get the date  
            date_element = art.find('time', class_='tribe-events-pro-photo__event-date-tag-datetime')
            date = date_element['datetime'] if date_element else "N/A"

            time_container = art.find('div', class_='tribe-events-pro-photo__event-datetime')
        
            start_time = "N/A"
            end_time = "N/A"
        
            if time_container:
                actual_times = time_container.find_all('time')
                # The first <time> is the start, the second is the end
                if len(actual_times) >= 1:
                    start_time = actual_times[0].get_text(strip=True)
                if len(actual_times) >= 2:
                    end_time = actual_times[1].get_text(strip=True)

            # Append to results
            events_results.append({
                "title": title,
                "image": image_url,
                "link": detail_url,
                "date": date,       # eg. FEB 23
                "start_time": start_time, # eg, 8:00 pm
                "end_time": end_time      # eg. 11:00 pm
            })
            
        except Exception as e:
            print(f"Error parsing event: {e}")
            continue

    return events_results


def get_um_music_events():
    events_results = []
    url = "https://umanitoba.ca/music/concert-hall-events"
    
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # This stays exactly as you had it
    articles = soup.find_all('article', class_='event-card-new')

    for art in articles:
        try:
            # 1. Title
            title_tag = art.find('h3')
            title = title_tag.get_text(strip=True) if title_tag else "Unknown Event"

            # 2. FIXED LINK LOGIC
            # We look "UP" for the <a> tag that wraps this article
            parent_link = art.find_parent('a')
            link = parent_link['href'] if parent_link else "N/A"

            # 3. Image (Corrected to your new HTML structure)
            img_tag = art.find('img')
            image_url = img_tag['src'] if img_tag else "default.jpg"

            # 4. Date (Staying with your month/day logic)
            month = art.find('div', class_='month').get_text(strip=True) if art.find('div', class_='month') else ""
            day = art.find('div', class_='day').get_text(strip=True) if art.find('div', class_='day') else ""
            event_date = f"{month} {day}"

            # 5. Times
            start_time = art.find('div', class_='start').get_text(strip=True) if art.find('div', class_='start') else "N/A"
            end_time = art.find('div', class_='end').get_text(strip=True) if art.find('div', class_='end') else "N/A"

            events_results.append({
                "title": title,
                "image": image_url,
                "link": link,
                "date": event_date,
                "start_time": start_time,
                "end_time": end_time
            })
            
        except Exception as e:
            continue

    return events_results

#Test 
#print(get_umsu_events())
#print(get_um_music_events())