import cv2
import pytesseract
from PIL import Image;
import requests
from matplotlib import pyplot as plt
from playwright.sync_api import sync_playwright


#this handles the version 
class InstaScraper:
    
    information = {
            
    }
    
    
    locators= {
        "link" : "",
        "image" : ""
    }
    
    
    def __init__(self, link_to_webPage ):
        self.link_to_webPage = link_to_webPage
       
    
    
    def getInfo(self):
        value ={
            "Image" : "",
            "Date" : "",
            
        }
        
        ListInfo = []
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True) 
            page = browser.new_page()
            page.goto(self.link_to_webPage, timeout=10000)
            images = page.locator(".xu96u03")
            
            print(images)
            #for image in range(images.count):
             #   print(images.nth(images).get_attribute("src"))
                #ListInfo.append(self.ImageAnalysis(image))
            
            
            browser.close()
        
    

    def ImageAnalysis(ImageUrl : str)-> str:
        img = cv2.imread(Image.open(requests.get(ImageUrl, stream=True).raw))
        
        


A = InstaScraper("https://www.instagram.com/umsu_cares/").getInfo()
    