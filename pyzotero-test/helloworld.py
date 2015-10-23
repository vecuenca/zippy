from pyzotero import zotero
zot = zotero.Zotero("2709796", "user", "2u8RmxJHzR4HLYl5ybdpxFxx")
items = zot.top(limit=5)
# we've retrieved the latest five top-level items in our library
# we can print each item's item type and ID
for item in items:
    print('Item: %s | Key: %s') % (item['data']['itemType'], item['data']['key'])
    updated = zot.add_tags(item, "tag", "tag666", "cherry")